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
  goItems: object(
    where: {_or: [{type: {_eq: "project"}, attrs: {_contains: {language: "Go"}}}, {type: {_eq: "piscine"}, name: {_ilike: "%Go%"}}]}
    distinct_on: [name]
  ) {
    name
    type
  }
  jsItems: object(
    where: {_or: [{type: {_eq: "project"}, attrs: {_contains: {language: "JavaScript"}}}, {type: {_eq: "piscine"}, name: {_ilike: "%JS%"}}]}
    distinct_on: [name]
  ) {
    name
    type
  }
  rustItems: object(
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
let goItems;
let jsItems;
let rustItems;
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
    goItems = data.data.goItems;
    jsItems = data.data.jsItems;
    rustItems = data.data.rustItems;
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

    const projects = [
        {name: "Go", progress: "15/28"},
        {name: "JS", progress: "2/12"},
        {name: "Go", progress: "15/28"},
        {name: "JS", progress: "2/12"},
        {name: "JS", progress: "2/12"},
        {name: "Go", progress: "15/28"},
    ];

    renderProfile(user);
    renderProjects(projects);
    renderNotification(audits);
    renderSkillChart(getTopSkills(skills));
    renderProgress(progresses);
});

function formatXP(bytes) {
    if (bytes >= 1_000_000) {
        return (bytes / 1_000_000).toFixed(2)+ "MB";
    } else if (bytes >= 1_000) {
        return (bytes / 1_000).toFixed(2)+ "KB";
    } else {
        return bytes+ "Bytes";
    }
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
    if(m!==""){
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
