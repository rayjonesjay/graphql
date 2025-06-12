const query = `
   {
  user {
    id
    login
    attrs
    auditRatio
   transactions(where: {_and: [{eventId: {_eq: 75}}]}, order_by: {createdAt: asc}) {
      object{
        name
        attrs
        type
      }
      amount
      createdAt
      eventId
      path
      type
    }
     audits(
      order_by: {createdAt: desc}
      where: {closedAt: {_is_null: true},group: {captain: {canAccessPlatform: {_eq: true}}}}
    ) {
      closedAt
      group {
        captainLogin
        path
        members {
          userLogin
        }
      }
      private {
        code
      }
    }
  
    events(where: {eventId: {_eq: 75}}) {
      level
    }
    progresses(where: {eventId: {_eq: 75}} order_by: {createdAt: desc}) {
      grade
      path
      createdAt
      updatedAt
    }
  }
  event(where: {path: {_eq: "/kisumu/module"}}) {
    startAt
    endAt
  }
  goProjects: object(
    where: {_or: [{type: {_eq: "project"}, attrs: {_contains: {language: "Go"}}}, {type: {_eq: "piscine"}, name: {_ilike: "%Go%"}}]}
    distinct_on: [name]
  ) {
    name
    type
  }
  jsProjects: object(
    where: {_or: [{type: {_eq: "project"}, attrs: {_contains: {language: "JavaScript"}}}, {type: {_eq: "piscine"}, name: {_ilike: "%JS%"}}]}
    distinct_on: [name]
  ) {
    name
    type
  }
  rustProjects: object(
    where: {_or: [{type: {_eq: "project"}, attrs: {_contains: {language: "rust"}}}, {type: {_eq: "piscine"}, name: {_ilike: "%Rust%"}}]}
    distinct_on: [name]
  ) {
    name
    type
  }
  
  skill_types: user {
    transactions_aggregate(
      distinct_on: [type]
      where: {type: {_nin: ["xp", "level", "up", "down"]}}
      order_by: [{type: asc}, {amount: desc}]
    ) {
      nodes {
        type
        amount
      }
    }
  }

}
`;

let userId;
let nickname;
let auditRatio;
let transactions;
let email;
let phone;
let level;
let grade;
let data;
let goProjects;
let jsProjects;
let rustProjects;
let audits;
let firstName;
let lastName;
let gender;
let dob;
let country;
let middleName;
let skills;
let progresses;

document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('logout')
    logoutBtn.addEventListener('click', logout)
    const token = localStorage.getItem("jwt");
    data = await fetchGraphQL(token, query)

    const userData =  data.data.user[0];
    userId = userData.id;
    nickname = userData.login;
    auditRatio = userData.auditRatio;
    transactions = userData.transactions;
    phone = userData.attrs.phone;
    email = userData.attrs.email;
    level = userData.events[0].level;
    goProjects = data.data.goProjects;
    jsProjects = data.data.jsProjects;
    rustProjects = data.data.rustProjects;
    audits = data.data.user[0].audits;
    country = userData.attrs.country;
    firstName = userData.attrs.firstName;
    middleName = userData.attrs.middleName;
    lastName = userData.attrs.lastName;
    gender = userData.attrs.gender;
    dob = userData.attrs.dateOfBirth;
    name = makeFullName(firstName,middleName,lastName);
    skills = data.data.skill_types[0].transactions_aggregate.nodes;
    progresses = userData.progresses;

    const user = {
        id: userId,
        name,
        nickname,
        email,
        dob,
        gender,
        country,
        phone,
        firstName,
        middleName,
        lastName,
        level,
        skills,
    }

    const projects = doneProjectsCount(transactions);

    renderProfile(user);
    renderProjects(projects);
    renderNotification(audits);
    renderSkillChart(getTopSkills(skills));
    renderProgress(progresses);
    renderXP(transactions);
});


function doneProjectsCount(trans) {
  let transactions = trans.filter(
    (transaction) => transaction.type === "xp"
  );

  // Create sets of completed project names for fast lookup
  let completedProjects = new Set();

  for (let i = 0; i < transactions.length; i++) {
    if (transactions[i].object && transactions[i].object.name) {
      completedProjects.add(transactions[i].object.name);
    }
  }
  console.log(completedProjects);

  // Count completed projects for each language
  let goDone = 0;
  let goTotal = goProjects.length;
  for (let i = 0; i < goTotal; i++) {
    if (completedProjects.has(goProjects[i].name)) {
      goDone++;
    }
  }

  let jsDone = 0;
  let jsTotal = jsProjects.length;
  for (let i = 0; i < jsTotal; i++) {
    if (completedProjects.has(jsProjects[i].name)) {
      jsDone++;
    }
  }

  let rustDone = 0;
  let rustTotal = rustProjects.length;
  for (let i = 0; i < rustTotal; i++) {
    if (completedProjects.has(rustProjects[i].name)) {
      rustDone++;
    }
  }
  const totalDone = goDone + jsDone + rustDone;
  const totalProjects = goTotal + jsTotal + rustTotal;

  return[
    {name: "Go",progress: `${goDone}/${goTotal}`},
    {name: "JS",progress: `${jsDone}/${jsTotal}`},
    {name: "Rust",progress: `${rustDone}/${rustTotal}`},
    {name:"Total",progress: `${totalDone}/${totalProjects}`},
    ]
}


function formatXP(xp) {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}MB`;
  } else if (xp >= 1000) {
    const kbValue = xp / 1000;
    return kbValue % 1 === 0
      ? `${Math.floor(kbValue)}kB`
      : `${kbValue.toFixed(1)}kB`;
  }
  return xp.toString();
}

function getTopSkills(skills, topN = 5) {
    return [...skills]
        .sort((a, b) => b.amount - a.amount)
        .slice(0, Math.min(topN, skills.length));
}

function makeFullName(f,m,l){
    f=f.trim();
    m=m.trim();
    l=l.trim();
    if(m!=="" && m!==null && m.toLowerCase()!=="n/a"){
        return `${f} ${m} ${l}`;
    }
    return `${f} ${l}`;
}

async function fetchGraphQL(token, query) {
    try {
        const response = await fetch(
            "https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ query }),
            }
        );

        if (!response.ok) {
            throw new Error("GraphQL Request Failed");
        }
        const data = await response.json();
        console.log("data>>>",data);
        return data;
    } catch (error) {
        return null;
    }
}
