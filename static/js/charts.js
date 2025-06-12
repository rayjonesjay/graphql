let totalXP;
function renderXP(transactions){
    const el = document.getElementById("grade");
    el.innerHTML = `
        <svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="200" height="100" rx="10" ry="10" fill="#f0f0f0" stroke="#333" stroke-width="2"/>
            <text x="100" y="40" text-anchor="middle" font-family="Arial" font-size="16" fill="#333">Total XP</text>
            <text id="total-xp" x="100" y="70" text-anchor="middle" font-family="Arial" font-size="24" font-weight="bold" fill="#4CAF50">0</text>
        </svg>
    `
    totalXP = transactions
        .filter(tx => tx.type === "xp")
        .reduce((sum, tx) => sum + tx.amount, 0);
    document.getElementById('total-xp').textContent = formatXP(totalXP);
}

function renderProjects(projects) {
    const el = document.getElementById("projects");
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

const elProf = document.querySelector(".profile");
const elAvatar = document.querySelector(".avatar");
function renderProfile(profile){
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

const gradeDiv = document.getElementById('grade');
function renderGrade(progresses){
    const grade = CalculateGrade(progresses);
    gradeDiv.innerHTML = `
        <h1>Grade: ${grade}</h1>
    `
}

function CalculateGrade(arr) {
    let totalGrade = 0;
    for (const p of arr) {
        if (p.grade !== null && p.path.includes('/kisumu/module')) {
            totalGrade += p.grade;
        }
    }
    return totalGrade.toFixed(2);
}


function renderNotification(auditEvents) {
    const notificationContainer = document.querySelector(".notification");

    const notificationButton = document.querySelector(".see-notification-button");
    const notificationToggle = document.getElementById("notification-toggle");

    notificationButton.addEventListener('click', () => {
        notificationToggle.checked = !notificationToggle.checked;
    });

    // console.log("renderNotification", auditEvents);

    if (notificationContainer) {
        notificationContainer.innerHTML = '';
    }

    if (auditEvents.length === 0) {
        notificationContainer.innerHTML = `<span class="no-notifications">No new audits</span>`;
        return;
    }

    for (let i = 0; i < auditEvents.length; i++) {
        const currentEvent = auditEvents[i];
        console.log("curr eve",currentEvent);
        const captainLogin = currentEvent.group.captainLogin;
        const paths = currentEvent.group.path.split('/');
        const code = currentEvent.private.code;
        const projectName = paths[paths.length-1];
        notificationContainer.innerHTML += `
            <span>project: ${projectName} <br> leader: ${captainLogin} <br> code: ${code}</span>
        `;
    }
}

// render skill chart
function renderSkillChart(skills, containerId = 'skill-chart') {
    const svgWidth = skills.length * 60 + 40;
    const svgHeight = 300;
    const barWidth = 20;
    const barGap = 20;
    const chartBottom = svgHeight - 180;
    const scale = 1; // 1 unit = 2px

    const abbreviate = label => label.replace('skill_', '').replace('-', ' ').split(' ')
        .map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

    let svg = `<svg class="skill-chart" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <style>
        .bar { fill: #0193ff; }
        .label { font-size: 5px; fill: #333; text-anchor: middle; }
        .value { font-size: 5px; fill: #000; text-anchor: middle; }
    </style>`;

    skills.forEach((skill, i) => {
        const barHeight = skill.amount * scale;
        const x = i * (barWidth + barGap) + 20;
        const y = chartBottom - barHeight;
        const label = abbreviate(skill.type);

        svg += `
            <rect class="bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}"/>
            <text class="value" x="${x + barWidth / 2}" y="${y - 5}">${skill.amount}</text>
            <text class="label" x="${x + barWidth / 2}" y="${chartBottom + 15}">${label}</text>
        `;
    });

    svg += `</svg>`;

    document.getElementById(containerId).innerHTML = svg;
}


function logout(){
    console.log("logging out");
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem('jwt');
    console.log('logout complete');
    window.location.href = '/';
}

function renderProgress(progresses) {
    // Filter out null grades and sort by date
    const cleaned = progresses
        .filter(p => p.grade !== null)
        .map(p => ({
            date: new Date(p.createdAt),
            grade: p.grade
        }))
        .sort((a, b) => a.date - b.date);

    // If no valid data, exit
    if (cleaned.length === 0) return;

    // Create cumulative data by summing grades
    let cumulativeData = [];
    let totalGrade = 0;
    
    // Add initial point at 0 on April 8th, 2024
    cumulativeData.push({
        date: new Date('2024-04-08'),
        grade: 0
    });
    
    for (const item of cleaned) {
        totalGrade += item.grade;
        cumulativeData.push({
            date: item.date,
            grade: totalGrade
        });
    }

    const minDate = cumulativeData[0].date;
    const maxDate = cumulativeData[cumulativeData.length - 1].date;
    const maxGrade = cumulativeData[cumulativeData.length - 1].grade;

    // Set fixed Y-axis scale with increments of 10
    const yMax = Math.ceil(maxGrade / 10) * 10; // Round up to nearest 10
    const yTicks = yMax / 10; // One tick every 10 units

    const svgWidth = 800;
    const svgHeight = 300;
    const padding = 50;

    function scaleX(date) {
        return padding + ((date - minDate) / (maxDate - minDate)) * (svgWidth - 2 * padding);
    }

    function scaleY(grade) {
        return svgHeight - padding - (grade / yMax) * (svgHeight - 2 * padding);
    }

    const pathData = "M " + cumulativeData.map(p => `${scaleX(p.date)} ${scaleY(p.grade)}`).join(" L ");

    const xTicks = 6;

    const xLabels = Array.from({ length: xTicks + 1 }, (_, i) => {
        const t = minDate.getTime() + (i / xTicks) * (maxDate.getTime() - minDate.getTime());
        const d = new Date(t);
        return {
            x: scaleX(d),
            label: `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
        };
    });

    const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
        const grade = i * 10; // Fixed increments of 10
        return {
            y: scaleY(grade),
            label: grade.toFixed(0) // No decimal places
        };
    });

    const svg = document.getElementById("grades-svg");

    svg.setAttribute("width", svgWidth);
    svg.setAttribute("height", svgHeight);

    svg.innerHTML = `
        <!-- Axes -->
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="black"/>
        <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="black"/>

        <!-- Y-axis ticks and labels -->
        ${yLabels.map(({ y, label }) => `
            <line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="black" />
            <text x="${padding - 10}" y="${y + 4}" font-size="10" text-anchor="end">${label}</text>
        `).join('')}

        <!-- X-axis ticks and labels -->
        ${xLabels.map(({ x, label }) => `
            <line x1="${x}" y1="${svgHeight - padding}" x2="${x}" y2="${svgHeight - padding + 5}" stroke="black" />
            <text x="${x}" y="${svgHeight - padding + 15}" font-size="10" text-anchor="middle">${label}</text>
        `).join('')}

        <!-- Line Path -->
        <path d="${pathData}" fill="none" stroke="#6b21a8" stroke-width="2" />

        <!-- Data Points -->
        ${cumulativeData.map(p => `
            <circle cx="${scaleX(p.date)}" cy="${scaleY(p.grade)}" r="3" fill="#6b21a8">
                <title>${p.date.toISOString().split('T')[0]}: Total Grade ${p.grade.toFixed(2)}</title>
            </circle>
        `).join("")}

        <!-- Grid lines -->
        ${yLabels.map(({ y }) => `
            <line x1="${padding}" y1="${y}" x2="${svgWidth - padding}" y2="${y}" stroke="#ddd" stroke-dasharray="2,2" />
        `).join('')}
    `;
}