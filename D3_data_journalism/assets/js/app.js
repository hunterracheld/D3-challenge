// Define svg container dimensions
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 40,
    bottom: 100,
    left: 80,
    right: 100
};

// Define dimensions for graphic
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG wrapper, append SVG group for chart, and shift chart by top and left margins
// Wrapper:
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append SVG group:
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Define initial parameters
var chosenXAxis = "age";

// Function for updating X-axis scale on click
function xScale(data, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;
}

// Function for updating X-axis variable on click
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
    
}

// Function for updating circles group during transition
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.selectAll("circle").transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    
    circlesGroup.selectAll("text").transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// Function for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === "age") {
        var label = "Median Age";
    }

    else if (chosenXAxis === "income") {
        var label = "Median Household Income";
    }

    else {
        var label = "Poverty Rate";
    }


    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${label}: ${d[chosenXAxis]}<br>Obesity: ${d.obesity}%`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below


d3.csv("assets/data/data.csv").then(function (data, err) {
    if (err) throw err;
    console.log
    console.log('loaded state data', data);

    // Parse data
    data.forEach(function (data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.healthcareLow = +data.healthcareLow;
        data.healthcareHigh = +data.healthcareHigh;
        data.obesity = +data.obesity;
        data.obesityLow = +data.obesityLow;
        data.obesityHigh = +data.obesityHigh;
        data.smokes = +data.smokes;
        data.smokesLow = +data.smokesLow;
        data.smokesHigh = +data.smokesHigh;

    })

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create Y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.obesityHigh)])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    console.log(bottomAxis);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append y axis
    chartGroup.append("g")
        .call(leftAxis);
    
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("g");

    circlesGroup.append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.obesity))
        .attr("r", 10)
        .attr("opacity", "0.75")
        .classed("stateCircle", true);

    circlesGroup.append("text")
        .classed("stateText", true)
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.obesity)); 

    // Append initial circles
    // var circlesGroup = chartGroup.selectAll("circle")
    //     .data(data)
    //     .enter()
    //     .append("circle")
    //     .attr("cx", d => xLinearScale(d[chosenXAxis]))
    //     .attr("cy", d => yLinearScale(d.obesity))
    //     .attr("r", 10)
    //     .attr("opacity", "0.75")
    //     .classed("stateCircle", true)
    //     .append("text")
    //     .classed("stateText", truex)
    //     .text(d => d.abbr); 
    
    // var circlesText = circlesGroup.append("text")
    //     .data(data)
    //     .enter()
    //     .attr ("cx", d => xLinearScale(d[chosenXAxis]))
    //     .attr ("cy", d => yLinearScale(d.obesity))
    //     .text (d.abbr)
   
    
    // Create group for three x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") // value to grab for event listener
        .classed("active", true)
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("active", true)
        .text("Household Income (Median)");

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    // Append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Obese (%)");

    // Update ToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // X axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // Get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // Replace chosenXAxis with value
                chosenXAxis = value

                console.log(chosenXAxis);

                // Below functions also found above CSV import
                // Updates x scale for new data
                xLinearScale = xScale(data, chosenXAxis);

                // Updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // Updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // Updates tooltips with new data
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // Change classes to change bold text
                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }

                else if (chosenXAxis = "poverty") {
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false)  
                }

                else {
                     incomeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});

