function renderProjects(projects) {
    const el = document.getElementById("projects");

    // Set title and empty cards container
    el.innerHTML = `
        <div class="cards">
            ${projects.map(p => `
                <div class="card">
                    <h4>${p.name}</h4>
                    <p>${p.progress}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderMetrics(data) {
    const el = document.getElementById("performance");
    el.innerHTML = `
        <div class="metric"><h3>XP Earned</h3><p>${data.xp}</p></div>
        <div class="metric"><h3>Level</h3><p>${data.level}</p></div>
        <div class="metric"><h3>Grade</h3><p>${data.grade}</p></div>
    `;
}

function renderXPChart(chartData) {
    const el = document.getElementById("xp-chart");
    el.innerHTML = `<h3>XP Progression</h3><svg height="200" width="100%"></svg>`;
    // placeholder for future SVG implementation
}

const elProf = document.querySelector(".profile");
const elAvatar = document.querySelector(".avatar");

function renderProfile(profile){
    console.log("renderProfile (profile)",profile);
    console.log("renderProfile (profile.name) ",profile.name);

    // take the first letter of each of their names and combine them to form an abbreviation eg: John Doe -> JD
    const abbreviation = makeAbbreviation(profile.name);

    elAvatar.innerHTML = `
    <svg class="avatar-svg" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="#75d7f1" />
        <text class="glowing-text" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">${abbreviation}</text>
    </svg>
    `;
    elProf.innerHTML = `
        <h2>${profile.name}</h2>
        <p>login: ${profile.nickname}</p>
        <br>
        <p>email: ${profile.email}</p>
        <p>phone: ${profile.phone}</p>
        <p>country: ${profile.country}</p>
        <p>gender: ${profile.gender}</p>
        <p>dob: ${formatDate(profile.dob)}</p>
    `
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}-${month}-${day}`;
}
function makeAbbreviation(fullName){
    const names = fullName.split(" ");
    let abbreviation = ""
    for (let i = 0; i < names.length; i++) {
        abbreviation = abbreviation + names[i][0];
    }
    return abbreviation;
}

function calculateGrade(grades){
    let sum = 0;
    let realLen = 0;
    for (let i = 0; i < grades.length; i++) {
        let grade = grades[i].grade;
        if (grade !== null) {
            realLen++;
            sum += parseInt(grade,10);
        }
    }
    return ((sum/realLen) * 100).toFixed(2);
}


function renderNotification(auditEvents) {
    const notificationContainer = document.querySelector(".notification");

    const notificationButton = document.querySelector(".see-notification-button");
    const notificationToggle = document.getElementById("notification-toggle");

    notificationButton.addEventListener('click', () => {
        notificationToggle.checked = !notificationToggle.checked;
    });

    console.log("renderNotification", auditEvents);

    if (notificationContainer) {
        notificationContainer.innerHTML = '';
    }

    if (auditEvents.length === 0) {
        notificationContainer.innerHTML = `<span class="no-notifications">No new audits</span>`;
        return;
    }

    for (let i = 0; i < auditEvents.length; i++) {
        const currentEvent = auditEvents[i];
        const captainLogin = currentEvent.group.captainLogin;

        notificationContainer.innerHTML += `
            <span>${captainLogin}</span>
        `;
    }
}
