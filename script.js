// Load the data and create the visualization
d3.csv('boston_311_2025_by_reason.csv').then(data => {
    // Parse the count as a number
    data.forEach(d => {
        d.Count = +d.Count;
    });

    // Sort by count in descending order
    const sortedData = data.sort((a, b) => b.Count - a.Count);
    
    let isShowingAll = false;

    // Function to update chart
    function updateChart(dataToUse) {
        // Set dimensions and margins based on data length
        const itemCount = dataToUse.length;
        const margin = { top: 30, right: 100, bottom: 60, left: 300 };
        const width = 1400 - margin.left - margin.right;
        const height = Math.max(800, itemCount * 35) - margin.top - margin.bottom;

        // Select the SVG element
        const svg = d3.select('#chart');

        // Clear any existing content
        svg.selectAll('*').remove();

        // Create a group element for margins
        const g = svg
            .attr('viewBox', [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const yScale = d3
            .scaleBand()
            .domain(dataToUse.map(d => d.reason))
            .range([0, height])
            .padding(0.1);

        const xScale = d3
            .scaleLinear()
            .domain([0, d3.max(dataToUse, d => d.Count)])
            .range([0, width]);

        // Create bars
        g.selectAll('.bar')
            .data(dataToUse)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.reason))
            .attr('width', d => xScale(d.Count))
            .attr('height', yScale.bandwidth())
            .on('mouseover', function(event, d) {
                // Show tooltip
                d3.select(this)
                    .attr('opacity', 0.8);

                // Add value label on hover
                g.append('text')
                    .attr('class', 'bar-label')
                    .attr('x', xScale(d.Count) + 10)
                    .attr('y', yScale(d.reason) + yScale.bandwidth() / 2)
                    .attr('text-anchor', 'start')
                    .attr('dominant-baseline', 'middle')
                    .attr('fill', '#2c3e50')
                    .attr('font-weight', 'bold')
                    .style('font-size', '18px')
                    .text(d.Count.toLocaleString());
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('opacity', 1);

                // Remove value label
                g.selectAll('.bar-label').remove();
            });

        // Add X axis
        const xAxis = g
            .append('g')
            .attr('class', 'x-axis axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => d.toLocaleString()))
            .style('font-size', '16px')
            .style('font-weight', '500');

        // Add Y axis
        const yAxis = g
            .append('g')
            .attr('class', 'y-axis axis')
            .call(d3.axisLeft(yScale))
            .style('font-size', '16px')
            .style('font-weight', '500');

        // Rotate x-axis labels
        xAxis
            .selectAll('text')
            .attr('text-anchor', 'end')
            .attr('dy', '0.15em')
            .attr('transform', 'rotate(-45)')
            .style('font-size', '18px')
            .style('font-weight', '500')
            .attr('dx', '-0.5em');

        // Add Y axis label
        g
            .append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - height / 2)
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .text('Reason for Call');

        // Add X axis label
        g
            .append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 80)
            .style('text-anchor', 'middle')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .text('Number of Calls');

        // Update SVG height
        svg.attr('height', height + margin.top + margin.bottom);
    }

    // Initial chart with top 10
    updateChart(sortedData.slice(0, 10));

    // Button toggle functionality
    document.getElementById('toggleBtn').addEventListener('click', function() {
        if (isShowingAll) {
            // Show top 10
            updateChart(sortedData.slice(0, 10));
            document.getElementById('toggleBtn').textContent = 'Show All Reasons';
            isShowingAll = false;
        } else {
            // Show all
            updateChart(sortedData);
            document.getElementById('toggleBtn').textContent = 'Show Top 10';
            isShowingAll = true;
        }
    });

}).catch(error => {
    console.error('Error loading data:', error);
    document.getElementById('chart-container').innerHTML = 
        '<p style="color: red;">Error loading data. Please make sure boston_311_2025_by_reason.csv is in the same directory.</p>';
});
