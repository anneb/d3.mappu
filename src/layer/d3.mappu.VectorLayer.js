  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      layer.type = 'vector';
      var _data = [];                         
	  var drawboard;
	  var _duration = config.duration || 0;
	  
      /* exposed properties*/
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data;
        },
        set: function(array) { 
            _data = array;
            draw(false);
        }
      });                                                           
      
      function addstyle(d){
      	  var entity = d3.select(this);
      	  if (d.style){
      	  	  for (var key in d.style) { 
      	  	  	  entity.style(key, d.style[key]);
      	  	  }
      	  }
      }
      
      var draw = function(rebuild){
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.selectAll('.entity').data(_data, function(d){
          	return d.id;
          });
          
          var newpaths = entities.enter().append('path').attr("d", layer.map.path)
            .classed('entity',true).classed(name, true)
            .style('stroke', 'blue')
            .each(addstyle);
          // Add events from config
          if (config.events){
              config.events.forEach(function(d){
                 newpaths.on(d.event, d.action);
              });
          }
          layer.refresh(rebuild?0:_duration);
      };
      
      var refresh = function(duration){
          var drawboard = layer.drawboard;
          drawboard.style('opacity', this.opacity).style('display',this.visible ? 'block':'none');
          if (layer.visible){
			  if (config.reproject){
				  var entities = drawboard.selectAll('.entity');
				  entities.transition().duration(duration).attr("d", layer.map.path).each(addstyle);
			  }
			  else {
				//based on: http://bl.ocks.org/mbostock/5914438
				var zoombehaviour = layer.map.zoombehaviour;
				//FIXME: bug in chrome? When zoomed in too much, browser tab stalls on zooming. Probably to do with rounding floats or something..
				drawboard
				  .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
				  .style("stroke-width", 1 / zoombehaviour.scale());
			  }
          }
          else {
          	  drawboard.selectAll('.entity').remove();
          }
      };
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  //                                                                          マップ
  