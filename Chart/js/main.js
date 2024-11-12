
 // Configuration object that contains essential properties for the bar chart
class BarChart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 500,
      containerHeight: _config.containerHeight || 140,
      margin: { top: 5, right: 20, bottom: 20, left: 50 }
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
    vis.xScale = d3.scaleLinear().range([0, vis.width]);
    vis.yScale = d3.scaleBand().range([0, vis.height]).paddingInner(0.15);

    vis.xAxis = d3.axisBottom(vis.xScale).ticks(6).tickSizeOuter(0);
    vis.yAxis = d3.axisLeft(vis.yScale).tickSizeOuter(0);

    vis.xAxisGroup = vis.svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${vis.height})`);

    vis.yAxisGroup = vis.svg.append("g")
      .attr("class", "axis y-axis");
  }

  updateVis() {
    const vis = this;

    // Update scales based on new data
    vis.xScale.domain([0, d3.max(vis.data, d => d.sales)]);
    vis.yScale.domain(vis.data.map(d => d.month));

    vis.renderVis();
  }

  renderVis() {
    const vis = this;

  
    vis.xAxisGroup.call(vis.xAxis);
    vis.yAxisGroup.call(vis.yAxis);

    // It binds the data (representing sales and months) to SVG rectangles 
    //(<rect>) that will represent the bars in the bar chart.
    const bars = vis.svg.selectAll(".bar")
      .data(vis.data, d => d.month);
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .merge(bars)
      .attr("x", 0)
      .attr("y", d => vis.yScale(d.month))
      .attr("width", d => vis.xScale(d.sales))
      .attr("height", vis.yScale.bandwidth());

    bars.exit().remove();
  }
}
// Loading the data and converting the string values to numerical values,
// then building the chart and assigning appropriate dimensions.
d3.csv("data/sales.csv")
  .then(data => {
   
    data.forEach(d => d.sales = +d.sales);

 
    const barchart = new BarChart({
      parentElement: '#chart',
      containerWidth: 600,
      containerHeight: 300
    });

    barchart.setData(data);
  })
  .catch(error => {
    console.error("Error loading the data:", error);
  });
