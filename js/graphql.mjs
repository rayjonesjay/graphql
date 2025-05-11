// graphql.js
import {domain} from "./auth"
const graphqlUrl = `https://${domain}/api/graphql-engine/v1/graphql`;

async function fetchGraphQL(query, variables = {}) {
    const jwt = localStorage.getItem('jwt');

    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables })
    });

    return await response.json();
}

async function getUserData() {
    const query = `
    {
      user {
        id
        login
        email
        createdAt
      }
    }
  `;
    return await fetchGraphQL(query);
}

async function getXpData() {
    const query = `
    {
      transaction(where: {type: {_eq: "xp"}}) {
        amount
        createdAt
        path
      }
    }
  `;
    return await fetchGraphQL(query);
}

async function getProgressData() {
    const query = `
    {
      progress {
        objectId
        grade
        createdAt
        path
      }
    }
  `;
    return await fetchGraphQL(query);
}