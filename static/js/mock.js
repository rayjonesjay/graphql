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



document.addEventListener('DOMContentLoaded', () => {
    const user = {
        name:"Ray Jones Muiruri",
        nickname:"Ray",
        shorthand:"RM",
        email:"rayjaymuiruri@gmail.com",
        dob:"17/12/20023",
        gender:"Male",
        country:"Kenya",
        phone:"0712345678",
    }

    const projects = [
        { name: "Go", progress: "15/28" },
        { name: "JS", progress: "2/12" },
        { name: "Rust", progress: "0/5" },
    ];
    console.log(projects);

    const dashboard = {
        xp: "955.55 KB",
        level: 29,
        grade: 35.98,
    };

    // const xpChart = [
    //     { label: "Jan", xp: 120 },
    //     { label: "Feb", xp: 250 },
    //     { label: "Mar", xp: 400 },
    //     { label: "Apr", xp: 700 },
    //     { label: "May", xp: 955 },
    // ];
    // renderMetrics(dashboard);
    // renderXPChart(xpChart);

    const token = localStorage.getItem("jwt");
    renderProfile(user);
    renderProjects(projects);
    fetchGraphQL(token).then(data => {
        if (data) {
            console.log("User data:", data);
        }
    });
});

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
        console.log(">>>>>", data);
        return data;
    } catch (error) {
        console.error("GraphQL Error:", error);
        return null;
    }
}
