function initMap(zones,data){

	var minMax = getMinMax(data);

	var minCount = minMax['min'];

	var maxCount = minMax['max'];

	var imgData = [1];

	var svg = d3.select('#map-canvas').append("svg")
							  .attr({'width': 1100, 'height': 900});

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
			 	'fill':'none',
			 	'stroke':'#666',
			 	'class':'zones',
			 	'stroke-width':3
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
								  	'zoneVal': d.name,
								  	'dataVal': d.points,
								  	'cursor': 'pointer',
								  	'class': 'markers'
								  })
								  .on('click', function(){

								  	var existingPaths = svg.selectAll('.plottedPath').remove();


								  	var start = d3.select(this).attr('zoneVal');
								  	var plotArray = [];
								  	for(var i in data){
								  		if(data[i]['start'] == start){
								  			plotArray.push(data[i]);
								  		}
								  	}
								  	for(var i in plotArray){
								  		plotPath(plotArray[i]);
								  	}

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

			 function plotPath(data){

			 	var start = [];
			 	var end = [];

			 	var imageSize = 40;

			 	var padding = imageSize/2;

			 	var nodes = svg.selectAll('.markers');

			 	var len = nodes[0].length;
			 				   
			 	for(var i = 0; i < len; i++){


			 		var selected = d3.select(nodes[0][i]);

			 		var zoneVal = selected.attr('zoneVal');

			 		if( zoneVal == data['start']){
			 			var x = parseFloat(selected.attr('x')) + padding;
			 			var y = parseFloat(selected.attr('y')) + imageSize;
			 			start = [x,y];
			 		}

			 		if(zoneVal == data['end']){
			 			var x = parseFloat(selected.attr('x')) + padding;
			 			var y = parseFloat(selected.attr('y')) + imageSize;
			 			end = [x,y];
			 		}

			 	}

			 	var count = data['value'];

			 	lineFunction(start, end, count);
			 }

			 function lineFunction(start,end, count){

			 	var width = getLineWidth(count);

			 	var line = svg.append('line')
			 				   .attr({'x1': start[0], 'y1': start[1], 'x2': end[0], 'y2': end[1]})
			 				   .style({'stroke': '#000', 'fill': '#000'})
			 				   .attr({'stroke-width':width, 'class': 'plottedPath'});

			 }

			 function getLineWidth(count){

			 	var xScale = d3.scale.linear()
			 					.range([1,6])
			 					.domain([minCount, maxCount]);

			 	var width = xScale(count);

			 	return width;

			 }
}


function getMinMax(data){

	var obj = {};

	var min = 0; var max = 0;

	for(var i in data){

		if(data[i]['count'] > max){
			max = data[i]['count'];
		}

	}

	min = max;

	for(var j in data){

		if(data[j]['count'] < min){
			min = data[j]['count'];
		}
	}

	obj['min'] = min;
	obj['max'] = max;

	return obj;
}