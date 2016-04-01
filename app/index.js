require('./main.less');
require('d3');
require('./heatmap.js');
const data = {};
const Sankey = require('d3-sankey').sankey;
const dataJson = require('./data.json');
const $ = require('jquery')
const nodeMap = {};
const margin = {top: 30, right: 1, bottom: 50, left: 1};
const width = (960 - margin.left - margin.right);
const height = 600 - margin.top - margin.bottom;
const color = d3.scale.category20();

data.nodes = [
    {name: "Bilisim Teknolojileri"},
    {name: "Medya, Iletisim ve Yayincilik"},
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

data.links = dataJson.reduce(function(result, curr) {
  result[curr.lisans + "_" + curr.Sektor] = {
    source: curr.lisans,
    target: curr.Sektor,
    class: curr.Sektor.replace(/\s+/g, '')+" "+ curr.lisans.replace(/\s+/g, '')+" link",
    value: (result[curr.lisans + "_" + curr.Sektor] || { value: 0 }).value + 1,
  };

  return result;
}, {});

data.links = Object.keys(data.links).map(key => data.links[key]);

data.links = data.links.map(function(x){
  return {
    source: nodeMap[x.source],
    target: nodeMap[x.target],
    class: x.class,
    value: x.value
  }
});

const svg = d3.select("#chart").append("svg")
        .attr({
          width: width + margin.left + margin.right,
          height: height + margin.top + margin.bottom
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const sankey = Sankey()
        .nodeWidth(30)
        .nodePadding(10)
        .size([width, height]);

const path = sankey.link();
sankey.nodes(data.nodes)
  .links(data.links)
  .layout(32);

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
   let myarray = [];
   myarray.push(data.nodes[i].name);
   g.sourceLinks.forEach(function(source){
     myarray.push(source.target.name);
   });
   g.targetLinks.forEach(function(source){
     myarray.push(source.source.name);
   });
   myarray.forEach(function(source){
     elements = elements.filter(function(d) { return d.name != source })
   })

   elements.transition()
       .style("opacity", opacity);

   svg.selectAll(".link")
       .filter(function(d) { return d.source.name != data.nodes[i].name && d.target.name != data.nodes[i].name })
     .transition()
       .style("opacity", opacity);
 };
}
