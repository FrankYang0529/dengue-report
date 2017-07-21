// $('#barAndLine-after-login').hide()
$('#barAndLine-login').hide()
$('.glyphicon-warning-sign').hide()
$('#barAndLine-login-btn').on('click',function(e){
  e.preventDefault()
  var username = $('#usr').val().toLowerCase()
  var password = $('#pwd').val().toLowerCase()
  if( username === 'govuser' && password === 'dengue' ) {
    $('#barAndLine-login').hide()
    $('#barAndLine-after-login').show()
    $('#barAndLine-select-country').trigger('change')
  } else {
    $('.glyphicon-warning-sign').show()
    $('#pwd-form').addClass('has-error has-feedback')
  }
})
$("#barAndLine-select-country").change(function () {
  $('#barAndLine-name').html('<h3 class="text-center">資料載入中...</h3>');
  var country = $("#barAndLine-select-country").val();

  d3.json("result_2017.json", function (error, data) {
    updatebarAndLineTownForm(data);
    updatebarAndLineTitle();
  })
});

$("#barAndLine-select-town").change(function () {
  $('#barAndLine-name').html('<h3 class="text-center">資料載入中...</h3>');
  var country = $("#barAndLine-select-country").val();
  var town = $("#barAndLine-select-town").val();

  d3.json("result_2017.json", function (error, data) {
    updatebarAndLineVillageForm(data);
    updatebarAndLineTitle();
  })
});

$("#barAndLine-select-village").change(function () {
  $('#barAndLine-name').html('<h3 class="text-center">資料載入中...</h3>');
  var country = $("#barAndLine-select-country").val();
  var town = $("#barAndLine-select-town").val();
  var village = $('#barAndLine-select-village').val()

  d3.json("result_2017.json", function (error, data) {
    if (town === '全區'){
      appendPlot(data[2017][country].summary);
    } else if (village == '全里'){
      appendPlot(data[2017][country][town].summary);
    } else{
      appendPlot(data[2017][country][town][village].summary);
    }
    updatebarAndLineTitle();
  })
});

function updatebarAndLineTownForm(data) {

  var country = $("#barAndLine-select-country").val();
  var townsHasData = window.getKeys(data[2017][country])
  if (townsHasData.length > 0) {
    $("#barAndLine-select-town").empty();
    townsHasData.forEach(function (town) {
      if(town === 'summary')
        return
      var insertHTML = "<option value='{0}'>{0}</option>".format(town, town);
      $("#barAndLine-select-town").append(insertHTML);
    });
    $("#barAndLine-select-town").prepend("<option value='全區'>全區</option>");
    $("#barAndLine-select-town").val('全區');
    $('#barAndLine-select-town').trigger("change");
  }
}

function updatebarAndLineVillageForm(data) {
  var country = $("#barAndLine-select-country").val();
  var town = $("#barAndLine-select-town").val();
  var villageHasData = window.getKeys(data[2017][country][town])
  if (villageHasData.length > 0) {
    $("#barAndLine-select-village").empty();
    villageHasData.forEach(function (village) {
      if (village === 'summary')
        return
      var insertHTML = "<option value='{0}'>{0}</option>".format(village, village);
      $("#barAndLine-select-village").append(insertHTML);
    });
    $("#barAndLine-select-village").prepend("<option value='全里'>全里</option>");
    $("#barAndLine-select-village").val('全里');
    $('#barAndLine-select-village').trigger("change");
  } else {
    appendPlot(data[2017][country].summary);
    $("#barAndLine-select-village").empty();
    $("#barAndLine-select-village").prepend("<option value='全里'>全里</option>");
  }
}

function updatebarAndLineTitle() {
  var country = $("#barAndLine-select-country").val();
  var town = $("#barAndLine-select-town").val();
  var village = $('#barAndLine-select-village').val()
  var barAndLineTitle;

  if (town === '無資料') {
    barAndLineTitle = '<h3 class="text-center">暫無資料</h3>';
    $('#barAndLine-content').empty();
  } else {
    barAndLineTitle = '<h3 class="text-center">' + country + ' / ' + town + ' / ' + village + '</h3>';
  }

  $('#barAndLine-name').hide();
  $('#barAndLine-name').html(barAndLineTitle);
  $('#barAndLine-name').fadeIn('slow');
}

function appendPlot(data){
  $("#barAndLine-content").empty();
  var margin = {
    top: 70,
    right: 60,
    bottom: 70,
    left: 60
  }
  ,width = $('.container').width()*10/12 - 60 - margin.left - margin.right
  ,height = 300 - margin.top - margin.bottom;

  var rangeBand = width / data.length
  var barWidth = rangeBand / 4

  var svg = d3.select("#barAndLine-content").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scale.linear().range([0, width - barWidth]);

  var y = d3.scale.linear().range([height, 0]);
  var y2 = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .tickValues(data.map(function(d){
      return d.weekNum;
    }))
    .orient("bottom")

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(6)

  var yAxis2 = d3.svg.axis()
    .scale(y2)
    .orient("right")
    .ticks(6)

  x.domain(d3.extent(data.map(function (d) {
    return +d.weekNum;
  })));

  y.domain([0, d3.max(data, function (d) {
    return d.sumEggNum;
  })]);
  y2.domain([0, 100]);

  var line = d3.svg.line()
    .defined(function (d) { return d.positiveRate != -10; })
    .x(function (d) {
      return x(d.weekNum);
    })
    .y(function (d) {
      return y2(d.positiveRate);
    });



  svg.selectAll("bar")
    .data(data)
    .enter()
    .append("rect")
    .style("fill", "blue")
    .attr("x", function (d) {
      return x(d.weekNum)
    })
    .attr("width", barWidth)
    .attr("y", function (d) {
      return y(d.sumEggNum);
    })
    .attr("height", function (d) {
      return height - y(d.sumEggNum);
    })

  svg.append("path")
    .attr("class", "line")
    .attr("d", line(data))
    .attr("transform", "translate(" + barWidth / 2 + ", 0)")

  svg.selectAll(".dot")
    .data(data.filter(function (d) { return d.positiveRate != -10; }))
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", line.x())
    .attr("cy", line.y())
    .attr("r", 3.5)
    .attr("transform", "translate(" + barWidth / 2 + ", 0)")

  svg.append("g")
    .attr("class", "y axis axis2")
    .attr("transform", "translate(" + width + ", 0)")
    .call(yAxis2)
    .append("text")
    .style("text-anchor", "end")
    .text("陽性率(%)")
    .attr("y", "-0.5em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + barWidth/2 + "," + height + ")")
    .call(xAxis)
    .append("text")
    .style("text-anchor", "end")
    .text("週數")
    .attr("x", width)
    .attr("dy", "3em")
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-90)")

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("總卵數(個)");
  
  var lineTip = d3.select("#barAndLine-content").append("div")
    .attr("class", "barAndLine-tooltip")
  var barTip = d3.select("#barAndLine-content").append("div")
    .attr("class", "barAndLine-tooltip")

  // append the rectangle to capture mouse
  svg.append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", function mousemove() {
      

      var x0 = x.invert(d3.mouse(this)[0] + barWidth / 2),
        bisect = d3.bisector(function(d){
          return d.weekNum
        }).left,
        i = bisect(data, x0);
        d = data[i-1]

        var yPos1 = y(d.sumEggNum)
        var yPos2 = y2(d.positiveRate)
        var xPos = x(d.weekNum) + 40

        if (Math.abs(yPos1 - yPos2) <  30){
          if(yPos1 < yPos2){
            yPos1 = yPos2 - 30
          } else {
            yPos2 = yPos1 - 30
          }
        }

        barTip.transition()
          .duration(100)
          .style("opacity", 0.7)
          .style("left", xPos + 'px')
          .style("top", '0px')

        barTip.html('卵數：' + d.sumEggNum);
        
        lineTip.transition()
          .duration(100)
          .style("opacity", 0.7)
          .style("left", xPos + 'px')
          .style("top", '30px')
        lineTip.html('陽性率：' + d.positiveRate + ' %');
    })
    .on("mouseout", function () {
        barTip.transition()
          .duration(500)
          .style("opacity", 0);
        lineTip.transition()
          .duration(500)
          .style("opacity", 0);
    });
}

