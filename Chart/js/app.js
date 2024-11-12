// Configuration object that contains essential properties for the line chart
class LineChart {
    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 300,
            margin: { top: 20, right: 20, bottom: 30, left: 50 }
        };
        this.data = [];
        this.initVis();
    }

    setData(data) {
        this.data = data;
        this.updateVis();
    }

    initVis() {
        const vis = this;

     
    // Create the SVG element for the chart, and append it to the specified parent element
    // Set the width and height of the SVG based on the container dimensions
        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement).append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight)
            .append("g")
            .attr("transform", `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

    
    // The xScale is linear, meaning it will map data values directly to positions on the x-axis,
    // while the yScale is a band scale used for categorical data .
        vis.xScale = d3.scaleTime().range([0, vis.width]);
        vis.yScale = d3.scaleLinear().range([vis.height, 0]);


        vis.xAxis = d3.axisBottom(vis.xScale).ticks(6).tickSizeOuter(0);
        vis.yAxis = d3.axisLeft(vis.yScale).ticks(7).tickSizeOuter(0); 

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "axis y-axis");

        // Line function depend on data loaded
        vis.line = d3.line()
            .x(d => vis.xScale(d.date))
            .y(d => vis.yScale(d.close));  

        // Area generator function for color the area under the line function
        vis.area = d3.area()
            .x(d => vis.xScale(d.date))
            .y0(vis.height)  
            .y1(d => vis.yScale(d.close));  
    }

    updateVis() {
        const vis = this;

 // Update scales based on new data
        vis.xScale.domain(d3.extent(vis.data, d => d.date));
        // mean the domain of y statr from 1800 to 3400 only bacause we notic that the data value 
        // in range from 1800 to 3400
        vis.yScale.domain([1800, 3400]);  

        vis.renderVis();
    }

    renderVis() {
        const vis = this;
//I placed the styles here because when I added them in the CSS, there was a conflict between the different styles
//For the sake of speed, I placed them above.
        // Update axes with customized colors
        vis.xAxisGroup.call(vis.xAxis)
            .selectAll("path, line")
            .style("stroke", "#f9f6f6"); 

        vis.yAxisGroup.call(vis.yAxis)
            .selectAll("path, line")
            .style("stroke", "#f9f6f6"); 

       
        vis.svg.selectAll(".axis text")
            .style("fill", "white"); // Color for axis text

        // Bind data to the line path and update attributes
         // Remove previous line paths
        vis.svg.selectAll(".line-path").remove();
        vis.svg.selectAll(".area-path").remove(); 

        // Add area path under the line
        vis.svg.append("path")
            .datum(vis.data)
            .attr("class", "area-path")
            .attr("fill", "steelblue")  
            .attr("fill-opacity", 0.3) 
            .attr("d", vis.area);

        // Add line path
        vis.svg.append("path")
            .datum(vis.data)
            .attr("class", "line-path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")  
            .attr("stroke-width", 2)     
            .attr("d", vis.line);
    }
}
// Loading the data and converting the string values to numerical values,
// then building the chart and assigning appropriate dimensions.
d3.csv("data/sp_500_index.csv").then(data => {
  
    data.forEach(d => {
        d.date = d3.timeParse("%Y-%m-%d")(d.date); 
        d.close = +d.close; 
    });

   
    // Create a new instance of the LineChart class
    const lineChart = new LineChart({
        parentElement: '#chart2',
        containerWidth: 600,
        containerHeight: 300
    });

    lineChart.setData(data);
}).catch(error => {
    console.error("Error loading the data:", error);
});
