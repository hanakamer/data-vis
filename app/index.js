require('./main.less');
require('d3');
require('./heatmap.js');
const data = {};
const Sankey = require('d3-sankey').sankey;
const dataJson = require('./data.json');
const $ = require('jquery')
const nodeMap = {};
const formatNumber = d3.format(",.0f");
const format = function(d) { return formatNumber(d) + " TWh"; };
data.nodes = [
    {name: "Bilisim Teknolojileri"},
    {name: "Medya, Iletisim ve Tasarim"},
    {name: "Muhendis"},
    {name: "Akademik"},
    {name: "Saglik ve Sosyal Hizmetler"},
    {name: "Egitimci"},
    {name: "Ulastirma, Lojistik ve Haberlesme"},
    {name: "Adalet ve Guvenlik"},
    {name: "Is ve Yonetim"},
    {name: "Kultur, Sanat ve Tasarim"},
    {name: "Ticaret"},
    {name: "Mimar"},
    {name: "Bilim"},
    {name: "Temel Meslek"},
    {name: "Elektrik ve Elektronik"},
    {name: "Muhasebe"},
    {name: "Turizm"},
    {name: "Ekonomi"},
    {name: "Ogrenci"},
    {name: "Sigorta"},
    {name: "-"},
    {name: "?"},
    {name: "Muhendislik"},
    {name: "Egitim"},
    {name: "Diger"},
    {name: "Iletisim"},
    {name: "Sosyal Bilimler"},
    {name: "Siyasal Bilimler"},
    {name: "Isletme"},
    {name: "Iktisat"},
    {name: "Fen Bilimleri"},
    {name: "Saglik"},
    {name: "Guzel Sanatlar"},
    {name: "Hukuk"},
    {name: "Mimarlik"},
    {name: "BESYO"}
  ];

data.nodes.forEach(function(x){
  nodeMap[x.name] = x});
data.links= dataJson.map(function(x){
  return {
    source: x.lisans,
    target: x.Sektor,
    class: x.Sektor.replace(/\s+/g, '')+" "+ x.lisans.replace(/\s+/g, '')+" link",
    value: 1
  }
});
data.links = data.links.map(function(x){
  return {
    source: nodeMap[x.source],
    target: nodeMap[x.target],
    class: x.class,
    value: 1
  }
});


// Some setup stuff.
const margin = {top: 10, right: 1, bottom: 6, left: 1};
const width = 960 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
const color = d3.scale.category20();
// SVG (group) to draw in.
const svg = d3.select("#chart").append("svg")
        .attr({
          width: width + margin.left + margin.right,
          height: height + margin.top + margin.bottom
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// Set up Sankey object.
const sankey = Sankey()
        .nodeWidth(30)
        .nodePadding(10)
        .size([width, height]);

const path = sankey.link();
sankey.nodes(data.nodes)
  .links(data.links)
  .layout(32);

// Draw the links.
const link = svg.append("g").selectAll(".link")
        .data(data.links)
        .enter()
        .append("path")
        .attr('class', 'link')
        .attr("id", function(d,i){
          d.id = i;
          return "link-"+i;
        })
        .attr({
          d: path
        })
        .style("stroke", function(d){
        return d.color = color(d.source.name.replace(/ .*/, ""));})
        .style("stroke-width", function (d) {
          return Math.max(1, d.dy);
        })
link.append("title")
        .text(function (d) {
          return d.source.name + " to " + d.target.name + " = " + d.value;
        });
// Draw the nodes.
const nodes = svg.append("g").selectAll(".node")
        .data(data.nodes)
        .enter()
        .append("g")
        .attr('class'," node")
        .attr({
          transform: function (d) {
            return "translate(" + d.x + "," + d.y + ")";
          }
        })
        // .on("click",highlight_node_links)
        .call(d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function() {
  		  this.parentNode.appendChild(this); })
        .on("drag", dragmove))
        .on("mouseover", fade(0.3))
			  .on("mouseout", fade(1));


nodes.append("rect")
        .attr({
          height: function (d) {
            return d.dy;
          },
          width: sankey.nodeWidth()
        })
        .style({
          fill: function (d) {
            return d.color = color(d.name.replace(/ .*/, ""));
          },
          stroke: function (d) {
            return d3.rgb(d.color).darker(2);
          }
        })
        .append("title")
        .text(function (d) {
          return d.name;
        });
nodes.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");


function dragmove(d) {
  d3.select(this).attr("transform",
      "translate(" + (
      	   d.x = Math.max(0, Math.min(width - d.dx, d3.event.x))
      	) + "," + (
                 d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
          ) + ")");
  sankey.relayout();
  link.attr("d", path);
}

function fade(opacity) {
 return function(g, i) {
   let elements = svg.selectAll(".node");
   elements = elements.filter(function(d) {
     return d.name != data.nodes[i].name});
   elements.transition()
       .style("opacity", opacity);

   svg.selectAll(".link")
       .filter(function(d) { return d.source.name != data.nodes[i].name && d.target.name != data.nodes[i].name })
     .transition()
       .style("opacity", opacity);
 };
}
