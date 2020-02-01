import * as d3 from 'd3';
import View from 'girder/views/View';
import events from '../../events';
import HistoryTemplate from '../../templates/history/history.pug';
import '../../stylesheets/history/history.styl';

var History = View.extend({
  events:{},
  initialize(settings){

    this.statusMap = {
      "3":{
        color: "#53b653",
        name: "Success"
      },
      "4":{
        color: "#d44",
        name: "Error"
      },
      "2":{
        color: "#6666d5",
        name: "Running"
      },
      "1":{
        color: "#dbc345",
        name: "Queued"
      },
      "5":{
        color: "#545",
        name: "Canceled"
      },
      "0":{
        color: "#ccc",
        name: "Inactive"
      }
    }
    this.accessRecords  = settings.records;
    // this.controlPanel  = settings.controlPanel;
    this.currentUser  = settings.currentUser;
    this.$el.html(HistoryTemplate());
    this.render();
  },
  render(){

    this._pieChartRenderUsers(this.accessRecords);
    this._pieChartRenderTasks(this.accessRecords);
    this._pieChartRenderStatus(this.accessRecords, this.statusMap);
    this._tableRender(this.accessRecords);
    return this;
  },
  _pieChartRenderUsers(data){
    console.log($("#usersGraph").width())
    let userSvg = d3.select("#usersGraph")
            .append("svg").style("width",$("#usersGraph").width()+'px').style("height",$("#usersGraph").width()+'px')
            .append("g")
    let pieChartDisplay = [];
    let uniqueUserId = [...new Set(data.map(e => e.creator._id))];
    let randomColor = [];

    uniqueUserId.forEach(_.bind(function(userId, index){
      let record = {};
      record['id'] = index;
      record['user_id'] = userId;
      record['num_of_actions'] = data.filter(function(x){
        return x.creator._id == userId;
      }).length
      // User Name(login)
      record['display'] = data.filter(function(x){
        return x.creator._id === userId;
      })[0].creator.firstName + ' ' + data.filter(function(x){
        return x.creator._id === userId;
      })[0].creator.lastName + '(' + data.filter(function(x){
        return x.creator._id === userId;
      })[0].creator.login + ')';

      pieChartDisplay.push(record);

      let heatmapPercent = record['num_of_actions'] / data.length * 100;

      let hue = (190 +  heatmapPercent  * .5) / 360;
      let heatmapColor = this._hslToRgb(hue, 1, .5);
      randomColor.push(heatmapColor);

    },this));

    this._renderGraph("#usersGraph", randomColor, userSvg, pieChartDisplay);
    
  },
  _pieChartRenderTasks(data){
    let taskSvg = d3.select("#tasksGraph")
            .append("svg").style("width",$("#usersGraph").width()+'px').style("height",$("#usersGraph").width()+'px')
            .append("g")
    let pieChartDisplay = [];

    let uniqueTitle = [...new Set(data.map(e => e.task.title))];
    let randomColor = [];

    uniqueTitle.forEach(_.bind(function(title, index){
      let record = {};
      record['id'] = index;
      record['title'] = title;
      record['num_of_actions'] = data.filter(function(x){
        return x.task.title == title;
      }).length
      // title
      record['display'] = data.filter(function(x){
        return x.task.title == title;
      })[0].task.title.split('.')[1];

      pieChartDisplay.push(record);

      let heatmapPercent = record['num_of_actions'] / data.length * 100;

      let hue = (50 - heatmapPercent  * .5) / 360;
      let heatmapColor = this._hslToRgb(hue, 1, .5);
      randomColor.push(heatmapColor);

    },this));

    this._renderGraph("#tasksGraph", randomColor, taskSvg, pieChartDisplay);
  },
  _pieChartRenderStatus(data, statusMap){
    let statusSvg = d3.select("#statusGraph")
            .append("svg").style("width",$("#usersGraph").width()+'px').style("height",$("#usersGraph").width()+'px')
            .append("g")
    let pieChartDisplay = [];
    console.log(data);
    let uniqueStatus = [...new Set(data.map(e => e.job.status))];
    let randomColor = [];

    console.log(uniqueStatus);
    uniqueStatus.forEach(_.bind(function(status, index){
      let record = {};
      record['id'] = index;
      record['status'] = status;
      record['num_of_actions'] = data.filter(function(x){
        return x.job.status == status;
      }).length
      // status
      record['display'] = data.filter(function(x){
        return x.job.status == status;
      })[0].job.status;

      pieChartDisplay.push(record);

      let heatmapPercent = record['num_of_actions'] / data.length * 100;

      let hue = (50 - heatmapPercent  * .5) / 360;
      let heatmapColor = this._hslToRgb(hue, 1, .5);
      randomColor.push(heatmapColor);

    },this));

    this._renderGraph("#statusGraph", randomColor, statusSvg, pieChartDisplay, statusMap);
  },
  _renderGraph(domId, color, svg, pieChartDisplay, statusMap = undefined){
    let width = $(domId).height(),
        height = $(domId).height(),
        radius = Math.min(width * 0.8, height) / 2; 

    let g = svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal(color);

    let pie = d3.pie()
                .sort(null)
                .value(function(d) {
                  return d.num_of_actions;
                });
    let path = d3.arc()
        .outerRadius(radius - 20)
        .innerRadius(30)
        .cornerRadius(5);

    let label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);
    // console.log(pieChartDisplay);
    g.selectAll(".arc").remove()
    // g = this.svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    let arc = g.selectAll(".arc")
        .data(pie(pieChartDisplay))
        .enter().append("g")
        .classed("arc", true);
    let pathArea = arc.append("path")
        .attr("d", path)
        .attr("id", function(d, i) {
            // console.log(i)
            return "arc-" + i
        })
        .attr("style", "fill-opacity: 0.65;")
        .attr("fill", function(d) {
            if(d.data.status !== undefined){
              return statusMap[d.data.status].color;
            }
            return color(d.data.id);
        })
        .attr("data", function(d) {
            d.data["percentage"] = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
            return JSON.stringify(d.data);
        }); 
    g.selectAll('#tooltip_pieChart').remove();
    let tooltipg = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .attr("id", "tooltip_pieChart")
        .attr("style", "opacity:0")
        .attr("transform", "translate(-500,-500)");

    tooltipg.append("rect")
        .attr("id", "tooltipRect_pieChart")
        .attr("x", 0)
        .attr("width", 120)
        .attr("height", 80)
        .attr("opacity", 0.8)
        .style("fill", "#000000");

    tooltipg
        .append("text")
        .attr("id", "tooltipText_pieChart")
        .attr("x", 30)
        .attr("y", 15)
        .attr("fill", "#fff")
        .style("font-size", 10)
        .style("font-family", "arial")
        .text(function(d, i) {
            return "";
        });

    arc.append("text")
        .attr("dx", 30)
        .attr("dy", -5)
        .append("textPath")
        .attr("xlink:href", function(d, i) {
            return "#arc-" + i;
        })
        .text(function(d) {
            if(d.data.status !== undefined){
              return statusMap[d.data.display].name.toString();
            }
            return d.data.display.toString();
        });
    let helpers = {
        getDimensions: function(id) {
            var el = document.getElementById(id);
            var w = 0,
                h = 0;
            if (el) {
                var dimensions = el.getBBox();
                w = dimensions.width;
                h = dimensions.height;
            } else {
                console.log("error: getDimensions() " + id + " not found.");
            }
            return {
                w: w,
                h: h
            };
        }
    }
  },
  _tableRender(data){
    this.historyTable = $('#table').DataTable({
      data: data,
      columns: [
          {
            "className":      'details-control',
            "orderable":      false,
            "data":           null,
            "defaultContent": ''
          },
          {
            data: "job.jobId"
          },
          {
            "targets": 1,
            "render": function( data, type, full, meta ) {
                return full.task.title.split('.')[1];
            }
          },
          {
            "targets": 2,
            "render": function( data, type, full, meta ) {
                return full.task.dockerImage.split(':')[1];
            }
          },
          { 
            "targets": 3,
            "render": _.bind(function( data, type, full, meta ) {
                return this.statusMap[full.job.status].name;
            },this)
          },
          {
            data: "creator.login"
          },
          {
            "targets": -2,
            "render": function( data, type, full, meta ) {
                return full.created.slice(0,10);
            }
          }
      ],
      destroy: true,
      "lengthMenu": [[-1], ['ALL']],
      "scrollY": "calc(60vh - 52px)",
      "scrollCollapse": true,
      "dom": 'rt'
    });

  //   $('#table tbody').on('click', 'td.details-control', _.bind( function () {
  //       var tr = $(this).closest('tr');
  //       var row = this.historyTable.row( tr );
        
  //       console.log(row.data());
  //       if ( row.child.isShown() ) {
  //           // This row is already open - close it
  //           row.child.hide();
  //           tr.removeClass('shown');
  //       }
  //       else {
  //           // Open this row
  //           row.child( format(row.data()) ).show();
  //           tr.addClass('shown');
  //       }
  //   }, this));
  //   function format ( d ) {
  //     // `d` is the original data object for the row
  //     console.log(d);
  //     return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
  //         '<tr>'+
  //             '<td>Inputs:</td>'+
  //             '<td>'+d.task.inputs.ReferenceImages.name+'</td>'+
  //         '</tr>'+
  //         '<tr>'+
  //             '<td>Inputs2:</td>'+
  //             '<td>'+d.task.inputs.ReferenceLabel.name+'</td>'+
  //         '</tr>'+
  //         '<tr>'+
  //             '<td>Extra info:</td>'+
  //             '<td>And any further details here (images etc)...</td>'+
  //         '</tr>'+
  //     '</table>';
  // }
  },
  _hslToRgb(h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return 'rgb('+Math.floor(r * 255)+','+ Math.floor(g * 255)+','+ Math.floor(b * 255)+')';
  }
});

export default History;