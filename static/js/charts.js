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

function renderGradesChart(progressData) {
    const el = document.getElementById("grades-chart");
    
    if (!progressData || progressData.length === 0) {
        el.innerHTML = `
            <h3 class="chart-title">Grades Over Time</h3>
            <div style="text-align: center; padding: 2rem; color: #b0b0b0;">
                No grade data available
            </div>
        `;
        return;
    }

    // Filter and sort progress data
    const validGrades = progressData
        .filter(p => p.grade !== null && p.grade !== undefined)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    if (validGrades.length === 0) {
        el.innerHTML = `
            <h3 class="chart-title">Grades Over Time</h3>
            <div style="text-align: center; padding: 2rem; color: #b0b0b0;">
                No valid grade data available
            </div>
        `;
        return;
    }

    // Calculate cumulative average grades
    let cumulativeSum = 0;
    const chartData = validGrades.map((grade, index) => {
        cumulativeSum += parseFloat(grade.grade);
        const avgGrade = cumulativeSum / (index + 1);
        return {
            date: new Date(grade.createdAt),
            grade: avgGrade,
            originalGrade: parseFloat(grade.grade),
            path: grade.path
        };
    });

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 800;
    const height = 300;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Calculate scales
    const minDate = chartData[0].date;
    const maxDate = chartData[chartData.length - 1].date;
    const minGrade = Math.min(...chartData.map(d => d.grade));
    const maxGrade = Math.max(...chartData.map(d => d.grade));
    
    // Add some padding to the grade scale
    const gradePadding = (maxGrade - minGrade) * 0.1;
    const gradeMin = Math.max(0, minGrade - gradePadding);
    const gradeMax = Math.min(100, maxGrade + gradePadding);

    // Create SVG
    const svg = `
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#4a9eff;stop-opacity:0.3" />
                    <stop offset="100%" style="stop-color:#4a9eff;stop-opacity:0.05" />
                </linearGradient>
            </defs>
            
            <!-- Grid lines -->
            ${createGridLines(chartWidth, chartHeight, margin, gradeMin, gradeMax)}
            
            <!-- Chart area -->
            ${createChartArea(chartData, chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax)}
            
            <!-- Chart line -->
            ${createChartLine(chartData, chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax)}
            
            <!-- Data points -->
            ${createDataPoints(chartData, chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax)}
            
            <!-- Axes -->
            ${createAxes(chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax)}
        </svg>
        <div id="chart-tooltip" class="chart-tooltip"></div>
    `;

    el.innerHTML = `
        <h3 class="chart-title">Grades Over Time</h3>
        <div style="position: relative;">
            ${svg}
        </div>
    `;

    // Add interactivity
    addChartInteractivity();
}

function createGridLines(chartWidth, chartHeight, margin, gradeMin, gradeMax) {
    const gridLines = [];
    const numGridLines = 5;
    
    for (let i = 0; i <= numGridLines; i++) {
        const y = margin.top + (chartHeight * i / numGridLines);
        gridLines.push(`
            <line class="chart-grid-line" 
                  x1="${margin.left}" 
                  y1="${y}" 
                  x2="${margin.left + chartWidth}" 
                  y2="${y}" />
        `);
    }
    
    return gridLines.join('');
}

function createChartArea(data, chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax) {
    const points = data.map(d => {
        const x = margin.left + ((d.date - minDate) / (maxDate - minDate)) * chartWidth;
        const y = margin.top + chartHeight - ((d.grade - gradeMin) / (gradeMax - gradeMin)) * chartHeight;
        return `${x},${y}`;
    }).join(' ');
    
    const firstX = margin.left;
    const lastX = margin.left + chartWidth;
    const bottomY = margin.top + chartHeight;
    
    return `
        <polygon class="chart-area" 
                 points="${firstX},${bottomY} ${points} ${lastX},${bottomY}" />
    `;
}

function createChartLine(data, chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax) {
    const points = data.map(d => {
        const x = margin.left + ((d.date - minDate) / (maxDate - minDate)) * chartWidth;
        const y = margin.top + chartHeight - ((d.grade - gradeMin) / (gradeMax - gradeMin)) * chartHeight;
        return `${x},${y}`;
    }).join(' ');
    
    return `<polyline class="chart-line" points="${points}" />`;
}

function createDataPoints(data, chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax) {
    return data.map((d, i) => {
        const x = margin.left + ((d.date - minDate) / (maxDate - minDate)) * chartWidth;
        const y = margin.top + chartHeight - ((d.grade - gradeMin) / (gradeMax - gradeMin)) * chartHeight;
        
        return `
            <circle class="chart-point" 
                    cx="${x}" 
                    cy="${y}" 
                    data-grade="${d.grade.toFixed(2)}" 
                    data-original="${d.originalGrade}" 
                    data-date="${d.date.toLocaleDateString()}" 
                    data-path="${d.path}" />
        `;
    }).join('');
}

function createAxes(chartWidth, chartHeight, margin, minDate, maxDate, gradeMin, gradeMax) {
    const axes = [];
    
    // Y-axis labels
    const numYLabels = 5;
    for (let i = 0; i <= numYLabels; i++) {
        const grade = gradeMin + ((gradeMax - gradeMin) * i / numYLabels);
        const y = margin.top + chartHeight - (i * chartHeight / numYLabels);
        
        axes.push(`
            <text class="chart-axis-text" 
                  x="${margin.left - 10}" 
                  y="${y + 4}" 
                  text-anchor="end">
                ${grade.toFixed(1)}
            </text>
        `);
    }
    
    // X-axis labels
    const numXLabels = 4;
    for (let i = 0; i <= numXLabels; i++) {
        const date = new Date(minDate.getTime() + ((maxDate - minDate) * i / numXLabels));
        const x = margin.left + (i * chartWidth / numXLabels);
        
        axes.push(`
            <text class="chart-axis-text" 
                  x="${x}" 
                  y="${margin.top + chartHeight + 20}" 
                  text-anchor="middle">
                ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
        `);
    }
    
    return axes.join('');
}

function addChartInteractivity() {
    const tooltip = document.getElementById('chart-tooltip');
    const points = document.querySelectorAll('.chart-point');
    
    points.forEach(point => {
        point.addEventListener('mouseenter', (e) => {
            const grade = e.target.getAttribute('data-grade');
            const originalGrade = e.target.getAttribute('data-original');
            const date = e.target.getAttribute('data-date');
            const path = e.target.getAttribute('data-path');
            
            tooltip.innerHTML = `
                <div><strong>Date:</strong> ${date}</div>
                <div><strong>Average Grade:</strong> ${grade}%</div>
                <div><strong>Project Grade:</strong> ${originalGrade}%</div>
                <div><strong>Project:</strong> ${path.split('/').pop()}</div>
            `;
            
            tooltip.style.opacity = '1';
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 10 + 'px';
            tooltip.style.position = 'absolute';
            tooltip.style.zIndex = '1000';
        });
        
        point.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });
        
        point.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 10 + 'px';
        });
    });
}

const elProf = document.querySelector(".profile");
const elAvatar = document.querySelector(".avatar");

function renderProfile(profile){
    console.log(profile);
    console.log(">>>>>",profile.name);
    elAvatar.innerHTML = `
        ${profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
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