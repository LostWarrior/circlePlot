function initCircles(zones,data){

	var minMax = getMinMax(data);

	var minCount = minMax['min'];

	var maxCount = minMax['max'];

	var imgData = [1];

	var svg = d3.select('#map-canvas').append("svg")
							  .attr({'width': 1100, 'height': 900, 'class' : 'parentSvg'});

	var mapImage = svg.selectAll('.mapImage')
					  .data(imgData);

		mapImage.enter().append('svg:image')
				.attr({'xlink:href':'1floor.jpg','width':1100, 'height':900,'class': 'mapImage','opacity':0.5});

	var zones = svg.selectAll(".zones")
						.data(zones, function(d){
							return d.name;
						});

		zones.enter().append("polygon")
			 .attr({
			 	'points': function(d){

			 			      var arr = d.points;

			 			      var str = '';

			 			      for(var i = 0; i < arr.length; i = i+2){

			 			      	str += arr[i] + "," + arr[i+1] + " ";

			 			      }

			 			      return str;
			 			  },
			 	'fill':'#b2b2b2',
			 	"opacity": 0.6,
			 	'stroke':'#666',
			 	'class':'zones',
			 	'stroke-width':0
			  })
			 .each(function(d,i){

			 	var bBoxVal = this.getBBox();

			 	var padding = 10;

				var xyBox = [bBoxVal.x + bBoxVal.width/2, bBoxVal.y + bBoxVal.height/2];

				var gElem = svg.append('g')
							   .attr('class','markerG');

				var marker = gElem.append('svg:image')
								  .attr({
								  	'xlink:href': 'locationred.png',
								  	'width': 40,
								  	'height': 40,
								  	'x': (xyBox[0] - (4 * padding)),
								  	'y': (xyBox[1] - (3 * padding)),
								  	'xPoint': bBoxVal.x,
								  	'yPoint': bBoxVal.y,
								  	'zoneVal': d.name,
								  	'dataVal': d.points,
								  	'numberedVal': i,
								  	'cursor': 'pointer',
								  	'class': 'markers',
								  	'value': function(){
								  		var sel = d3.select(this).attr('zoneVal');

								  		var val;

								  		for(var i in data){

								  			if(data[i]['zone'] == sel){
								  				val = data[i]['value'];
								  				return val;
								  			}
								  		}

								  		return 0;

								  		
								  	}
								  })
								  .on('click', function(){

								  	var iVal = d3.select(this).attr('numberedVal');

								  	//var existingPaths = svg.selectAll('.childG').remove();

								  	d3.selectAll('.baseCircles').remove();

								  	var sel = d3.select(this).attr('zoneVal');

								  	var originX = d3.select(this).attr('xPoint');

								  	var originY = d3.select(this).attr('yPoint');

								  	var val = d3.select(this).attr('value');

								  	var total = data.length;

								  	var num = getNumberOfCircles(val);

								  	console.log(num);

								  	drawCluster(num,originX,originY,iVal);


								  });

				var text = gElem.append('text')
								.attr('x', xyBox[0] + (3 * padding))
								.attr('y', xyBox[1])
								.text(function(){
									return d.name;
								})
								.style({
									'text-anchor': 'middle', 
									'fill':'#c0392b', 
									'stroke-width': 0.6, 
									'stroke': '#c0392b',
									'font-size': '12px'
								})

			 })



			 function getNumberOfCircles(val){

			 	var val = parseInt(val);

			 	var linearRange = d3.scale.linear()
			 						.rangeRound([0,40])
			 						.domain([0,maxCount]);

			 	var num = linearRange(val);

			 	return num;

			 }

			 function drawCluster(num, valX, valY, iVal){

			 	//var colorArr = ['#FCFFF5','#D1DBBD','#91AA9D','#3E606F','#193441'];

			 	var colorArr = ['#1695a3','#1f8a70','#3E606F','#193441','#6B0C22'];
			 	var n = num;
			 	var m = 1;

			 	var widthN = 100; var heightN = 100; var padding = 1.5; var maxRadius = 12; var clusterPadding = 1;

			 	var color = d3.scale.linear().range(colorArr).domain(d3.range(n));

			 	var clusters = new Array(m);

			 	var nodes = d3.range(n).map(function() {

							  var i = Math.floor(Math.random() * m),
							      r = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
							      d = {
							      	dVal: iVal,
							        cluster: i,
							        radius: r,
							        x: Math.cos(i / m * 2 * Math.PI) * 100 + widthN / 2 + Math.random(),
							        y: Math.sin(i / m * 2 * Math.PI) * 100 + heightN / 2 + Math.random()
							      };
							  if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
							  return d;
							});

			 	var force = d3.layout.force()
							    .nodes(nodes)
							    .size([widthN, heightN])
							    .gravity(.02)
							    .charge(0)
							    .on("tick", tick)
							    .start();

				var svgCluster = d3.select(".parentSvg").append("g")
								   .attr({'class': 'childG', 'transform': 'translate(' + valX + ',' + valY + ')'});
							//.attr({'width': widthN, 'height': heightN, 'class': 'clusterSvg', 'x': valX, 'y': valY});

				var node = svgCluster.selectAll("circle")
							  .data(nodes)
							  .enter().append("circle")
							  .style({
							  	"fill": function(d) {
							  		return color(d.dVal); 
							  	},
							  	'fill-opacity': 0.6,
							  	"stroke": function(d) {
							  		return color(d.dVal); 
							  	},
							  	'stroke-opacity': 1
							  })
							  .call(force.drag);

							node.transition()
							    .duration(750)
							    .delay(function(d, i) { return i * 5; })
							    .attrTween("r", function(d) {
							      var i = d3.interpolate(0, d.radius);
							      return function(t) { return d.radius = i(t); };
							    });

							function tick(e) {
							  node
							      .each(cluster(10 * e.alpha * e.alpha))
							      .each(collide(.5))
							      .attr("cx", function(d) {
							      		return d.x; 
							      	})
							      .attr("cy", function(d) { return d.y; });
							}

				// Move d to be adjacent to the cluster node.
				function cluster(alpha) {
				  return function(d) {
				    var cluster = clusters[d.cluster];
				    if (cluster === d) return;
				    var x = d.x - cluster.x,
				        y = d.y - cluster.y,
				        l = Math.sqrt(x * x + y * y),
				        r = d.radius + cluster.radius;
				    if (l != r) {
				      l = (l - r) / l * alpha;
				      d.x -= x *= l;
				      d.y -= y *= l;
				      cluster.x += x;
				      cluster.y += y;
				    }
				  };
				}

				// Resolves collisions between d and all other circles.
				function collide(alpha) {
				  var quadtree = d3.geom.quadtree(nodes);
				  return function(d) {
				    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
				        nx1 = d.x - r,
				        nx2 = d.x + r,
				        ny1 = d.y - r,
				        ny2 = d.y + r;
				    quadtree.visit(function(quad, x1, y1, x2, y2) {
				      if (quad.point && (quad.point !== d)) {
				        var x = d.x - quad.point.x,
				            y = d.y - quad.point.y,
				            l = Math.sqrt(x * x + y * y),
				            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
				        if (l < r) {
				          l = (l - r) / l * alpha;
				          d.x -= x *= l;
				          d.y -= y *= l;
				          quad.point.x += x;
				          quad.point.y += y;
				        }
				      }
				      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
				    });
				  };
				}

				//node.attr("transform", 'translate(' + originX + ',' + originY + ')');


			 }


}


function getMinMax(data){

	var obj = {};

	var min = 0; var max = 10;

	for(var i in data){

		if(data[i]['value'] > max){
			max = data[i]['value'];
		}

	}

	min = max;

	for(var j in data){

		if(data[j]['value'] < min){
			min = data[j]['value'];
		}
	}

	obj['min'] = min;
	obj['max'] = max;

	return obj;
}