### GRAPHQL
A web application that displays your Zone01 student profile by fetching data from the (zone01) school's GraphQL API.

## Overview

This project creates a personalized profile page that visualizes your progress and achievements at Zone01 Kisumu. It leverages the school's GraphQL API to fetch and display your data in an interactive and visually appealing way.

### Features
Authentication System

Login with username or email
JWT-based authentication
Logout functionality
Error handling for invalid credentials
Profile Information

Basic user identification
XP amount tracking
Project grades display
Audit statistics
Skills progression
Interactive Statistics

SVG-based data visualization
Multiple graph types to track your progress
Visual representation of XP earned over time
Project success/failure ratio graphs
Audit participation statistics
Technologies Used
Frontend: HTML, CSS, JavaScript
Backend: Golang
Authentication: JWT (JSON Web Tokens)
Data Fetching: GraphQL API
Data Visualization: SVG for custom graphs
Hosting: render.com


## API Endpoints
GraphQL API: https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql

Authentication: https://learn.zone01kisumu.ke/api/auth/signin

Getting Started
Prerequisites
Modern web browser
Basic understanding of GraphQL queries
Installation
Clone the repository

```bash
git clone https://learn.zone01kisumu.ke/git/ramuiruri/graphql
```

Navigate to the project directory and run server

```bash
cd graphql && go run .
```

## Usage

Visit the login page on localhost:9999
Enter your Zone01 credentials (username/email and password)
Explore your personalized profile dashboard
Log out when finished


### Deployment
This project is hosted on render.com and can be accessed at [https://graphql-0t3x.onrender.com].