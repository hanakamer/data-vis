  const jsonFile = require('./heatmap_data.json')
  const margin = { top: 330, right: 0, bottom: 40, left: 100 }
  const width = (700 - margin.left - margin.right)
  const height = 760 - margin.top - margin.bottom
  const gridSize = Math.floor(width / 24)
  const legendElementWidth = gridSize*2
  const buckets = 6
  const colors = ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#31a354','#006d2c']
  const departments =[
    "Bilisim Teknolojileri",
    "Medya, Iletisim ve Yayincilik",
    "Muhendis",
    "Akademik",
    "Saglik ve Sosyal Hizmetler",
    "Egitimci",
    "Ulastirma, Lojistik ve Haberlesme",
    "Adalet ve Guvenlik",
    "Is ve Yonetim",
    "Kultur, Sanat ve Tasarim",
    "Ticaret",
    "Mimar",
    "Bilim",
    "Temel Meslek",
    "Elektrik ve Elektronik",
    "Muhasebe",
    "Turizm",
    "Ekonomi",
    "Ogrenci",
    "Sigorta"
  ]
const duration = [ "<1", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10-15", "15-20", "20-30", ">30"];

const svg = d3.select("#heatmap").append("svg")
              .attr({
                width: width + margin.left + margin.right,
                height: height + margin.top + margin.bottom
              })
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const departmentLabels = svg.selectAll(".departmentLabel")
    .data(departments)
    .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
      .attr("transform", function(d, i) {
          return "translate(" + gridSize / 10 + ", -20)" +
                 "rotate(-90 "+ ((i + 0.5) * gridSize) + " " + (-6) +")";
               })
      .style("text-anchor", "start")
      .attr("class", "departmentLabel mono axis")

const durationLabels = svg.selectAll(".durationLabel")
    .data(duration)
    .enter().append("text")
      .text(function(d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", "durationLabel mono axis" );

let heatmapdata = []
for (let i = 0; i < departments.length; i++){
  for (let k = 0; k < duration.length; k++) {
    heatmapdata[departments[i] + ',' + duration[k]] = {}
    heatmapdata[departments[i] + ',' + duration[k]]['department'] = departments[i];
    heatmapdata[departments[i] + ',' + duration[k]]['department_num'] = i;
    heatmapdata[departments[i] + ',' + duration[k]]['duration'] = duration[k];
    heatmapdata[departments[i] + ',' + duration[k]]['duration_num'] = k;
    heatmapdata[departments[i] + ',' + duration[k]]['values'] = []
    heatmapdata.push(heatmapdata[departments[i] + ',' + duration[k]])
  }
}
jsonFile.forEach(function(person){
  let val = '';
  if (person.Kacsene<1){
    val = "<1";
  }else if (person.Kacsene>=1 && person.Kacsene<11) {
    val = Math.round(person.Kacsene);
  }else if (person.Kacsene>10 && person.Kacsene<16) {
    val = "10-15";
  }else if (person.Kacsene>15 && person.Kacsene<21) {
    val = "15-20";
  }else if (person.Kacsene>20 && person.Kacsene<31) {
    val = "20-30";
  }else{
    val = ">30";
  }
  heatmapdata[person.Sektor + ',' + val ]['values'].push(person.memnuniyetiniz)
})

let data = {}
data = heatmapdata.map(function(x){
  let avg = 0;
  if (x.values.length > 0) {
    let sum = 0;
    sum = x.values.reduce(function(a, b) { return a + b; });
    avg = sum / x.values.length;
  }
 return {
   department: x.department,
   duration: x.duration,
   value: +avg,
   department_num: x.department_num,
   duration_num: x.duration_num
 }
});

const colorScale = d3.scale.quantile()
        .domain([0, buckets-1, d3.max(data, function(d) { return d.value })])
        .range(colors);

const cards = svg.selectAll(".duration")
      .data(data, function(d) {
        return d.department_num+":"+d.duration_num})
cards.append('title');
cards.enter().append("rect")
    .attr("x", function(d) { return (d.department_num)*gridSize })
    .attr("y", function(d,i) { return (d.duration_num)*gridSize })
    .attr("rx", 4)
    .attr("rx", 4)
    .attr("class", "duration bordered")
    .attr("width", gridSize)
    .attr("height", gridSize)
    .style("fill", function(d, i) { return colors[Math.round(d.value/2)]; });

cards.exit().remove();

const legend = svg.selectAll(".legend")
    .data([0].concat(colorScale.quantiles()), function(d) { return d; });

legend.enter().append("g")
    .attr("class", "legend");

legend.append("rect")
  .attr("x", function(d, i) { return legendElementWidth * i; })
  .attr("y", height)
  .attr("width", legendElementWidth)
  .attr("height", gridSize / 2)
  .style("fill", function(d, i) { return colors[i]; });

legend.append("text")
  .attr("class", "mono")
  .text(function(d) {
    return "≥ " + Math.round(d); })
  .attr("x", function(d, i) { return legendElementWidth * i; })
  .attr("y", height + gridSize);

legend.exit().remove();
