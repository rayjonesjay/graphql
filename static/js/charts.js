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
    console.log(profile);
    console.log(">>>>>",profile.name);
    elAvatar.innerHTML = `
        
    `
    elProf.innerHTML = `
        <h2>${profile.name}</h2>
        <p>${profile.nickname}</p>
        <br>
        <p>email: ${profile.email}</p>
        <p>phone: ${profile.phone}</p>
        <p>country: ${profile.country}</p>
        <p>gender: ${profile.gender}</p>
        <p>dob: ${profile.dob}</p>
    `
}