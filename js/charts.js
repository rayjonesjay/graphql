// charts.js
function createXpOverTimeChart(data) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "500");
    svg.setAttribute("height", "300");

    // Process data to get cumulative XP over time
    const processedData = processXpData(data);

    // Create axes
    createAxis(svg, processedData);

    // Create line graph
    const pathData = processedData.map((point, i) =>
        `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(point.cumulativeXp)}`
    ).join(' ');

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("stroke", "blue");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);

    return svg;
}

function createProjectSuccessChart(data) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "500");
    svg.setAttribute("height", "300");

    // Process data to count passed/failed projects
    const { passed, failed } = processProgressData(data);

    // Create pie chart
    const total = passed + failed;
    const passedAngle = (passed / total) * 360;

    // Passed slice
    const passedSlice = document.createElementNS("http://www.w3.org/2000/svg", "path");
    passedSlice.setAttribute("d", describeArc(150, 150, 100, 0, passedAngle));
    passedSlice.setAttribute("fill", "green");
    svg.appendChild(passedSlice);

    // Failed slice
    const failedSlice = document.createElementNS("http://www.w3.org/2000/svg", "path");
    failedSlice.setAttribute("d", describeArc(150, 150, 100, passedAngle, 360));
    failedSlice.setAttribute("fill", "red");
    svg.appendChild(failedSlice);

    // Legend
    createLegend(svg, passed, failed);

    return svg;
}