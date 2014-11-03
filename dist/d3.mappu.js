d3.mappu = d3.mappu || {};
d3.mappu.util = {};

//create a uniqueID for layers etc.
var _ctr = 0;   
d3.mappu.util.createID = function(){
    var id = "ッ-"+_ctr;
    _ctr++;
    return id;
};

//                                                                          マップ
;d3.mappu = d3.mappu || {};
/*
 * d3.mappu.Map is the central class of the API - it is used to create a map.
 */
 
/* d3.mappu.Map(element, config)

element = dom object
options: 
center: [long,lat]                  default = [0,0]
zoom: zoomlevel                     default = 0.0
layers: [layer]                     default = null
minZoom: zoomlevel                  default = 0.0
maxZoom: zoomlevel                  default = 13.0
maxView: [[long,lat],[long,lat]]    default = [[-180,90],[180,-90]]
projection: projection              default = d3.geo.mercator()
*/


d3.mappu.Map = function(elem, config) {
    return d3_mappu_Map(elem, config);
};

d3_mappu_Map = function(elem, config) {
    var map = {};
	var self = this;
	var _layers = [];
	//TODO: how to get the size of the map
	var width = elem.clientWidth || 1024;
	var height = elem.clientHeight || 768;
	
	//TODO check if elem is an actual dom-element
	//TODO: check if SVG?
	var _svg = d3.select(elem).append('svg')
		.attr("width", width)
		.attr("height", height);

	//TODO parse config;
	var _center = config.center || [0,0];
	var _projection = config.projection || d3.geo.mercator();
	var _zoom = config.zoom || 10;
	var _maxZoom = config.maxZoom || 24;
	var _minZoom = config.minZoom || 15;
	var _maxView = config.maxView;
	
	var draw = function(){
	    //Calculate tile set
        _tiles = _tile.scale(_zoombehaviour.scale())
          .translate(_zoombehaviour.translate())();
        //Calculate projection
        _projection
              .scale(_zoombehaviour.scale() / 2 / Math.PI)
              .translate(_zoombehaviour.translate());
        //Refresh layers
        _layers.forEach(function(d){
                d.refresh();
        });
    };
	
	_projection.scale(( _zoom << 12 || 1 << 12) / 2 / Math.PI)
        .translate([width / 2, height / 2]);
	
    var _projcenter = _projection(_center);     
    
    //TODO: reset this on projection change
    var _path = d3.geo.path()
        .projection(_projection);    
        
	var _zoombehaviour = d3.behavior.zoom()
        .scale(_projection.scale() * 2 * Math.PI)
        .scaleExtent([1 << _minZoom, 1 << _maxZoom])
        .translate([width - _projcenter[0], height - _projcenter[1]])
        .on("zoom", draw);
	_svg.call(_zoombehaviour);
	
    _projection
        .scale(1 / 2 / Math.PI)
        .translate([0, 0]);
    
    var _tile = d3.geo.tile()
        .size([width,height]);

    var _tiles = _tile.scale(_zoombehaviour.scale())
          .translate(_zoombehaviour.translate())();

// exposed functions

////getter/setter functions
	 Object.defineProperty(map, 'svg', {
        get: function() {
            return _svg;
        },
        set: function() {
            console.log("do not touch the svg");
        }
    });
// .zoom : (zoomlevel)
    Object.defineProperty(map, 'zoom', {
        get: function() {
            return _zoom=== undefined ? 0 : _zoom;
        },
        set: function(value) {
            _zoom = value;
        }
    });

// .minZoom : (zoomlevel)
    Object.defineProperty(map, 'minZoom', {
        get: function() {
            return _minZoom=== undefined ? 0 : _minZoom;
        },
        set: function(value) {
            _minZoom = value;
        }
    });
// .maxZoom : (zoomlevel)
    Object.defineProperty(map, 'maxZoom', {
        get: function() {
            return _maxZoom=== undefined ? 13 : _maxZoom;
        },
        set: function(value) {
            _maxZoom = value;
        }
    });
// .maxView : ([[long,lat],[long,lat]])
    Object.defineProperty(map, 'maxView', {
        get: function() {
            return _maxView=== undefined ? [[-180,90],[180,-90]] : _maxView;
        },
        set: function(value) {
            _maxView = value;
        }
    });
// .center : ([long,lat])
    Object.defineProperty(map, 'center', {
        get: function() {
            return _center === undefined?[0,0] : _center;
        },
        set: function(value) {
            _center = value;
        }
    });
// .projection : ({projection})
    Object.defineProperty(map, 'projection', {
        get: function() {
            return _projection=== undefined ? d3.geo.mercator() : _projection;
        },
        set: function(obj) {
          _projection = obj;
          _path = d3.geo.path()
            .projection(_projection);
          //TODO: redraw
        }
    });
    
    Object.defineProperty(map, 'path', {
            get: function(){return _path;},
            set: function(){console.warn('No setting allowed for path');}
    });
    
    Object.defineProperty(map, 'tiles', {
            get: function(){return _tiles;},
            set: function(){console.warn('No setting allowed for tile');}
    });
    
    Object.defineProperty(map, 'zoombehaviour', {
            get: function(){return _zoombehaviour;},
            set: function(){console.warn('No setting allowed for zoombehaviour');}
    });
    
    Object.defineProperty(map, 'layers', {
            get: function(){return _layers;},
            set: function(){console.warn('No setting allowed for layers');}
    });
    
	
////singular functions

    var addLayer = function(layer){
        if (!layer.id){
            console.warn('Not a valid layer. (No ID)');
            return false;
        }
        //Replace existing ID
        _layers.forEach(function(d){
            if (d.id == layer.id){
                d = layer; //TODO: can you replace an array item like this?
                return map;
            }
        });
        _layers.push(layer);
        layer._onAdd(map);
        return map;
    };
    var removeLayer = function(id){
        _layers.forEach(function(d,i){
            if (d.id == id){
                // ?? d.onRemove(self);
                _layers.splice(i,1);
                return map;
            }
        });
        return map;
    };   

// .removeLayers([{layer}])

// .refresh()
    
    
    map.addLayer = addLayer;
    map.removeLayer = removeLayer;
    map.draw = draw;
    return map;
};

//                                                                          マップ
;/**
 Generic layer object, to be extended.
**/


"use strict";
d3.mappu.Layer = function(name, config) {
    return d3_mappu_Layer(name, config);
};

d3_mappu_Layer = function(name, config){
    var layer = {};
    var _map;
    var _id = new Date().getTime();//TODO: automatic ID gen
    var _name = name;
    var opacity = 1;
    var visible = true;  
    var _display = 'block';
    
    var refresh = function(){
    };
    var moveUp = function(){
    };
    var moveDown = function(){
    };
    var addTo = function(map){
        _map = map;
        layer.drawboard = _map.svg.append('g');
        _map.addLayer(layer);
        return layer;
    };
    
    Object.defineProperty(layer, 'id', {
        get: function() {return _id;},
        set: function() {console.warn('setting ID not allowed for layer');}
    });
    
    Object.defineProperty(layer, 'name', {
        get: function() {
            return _name;
        },
        set: function(val) {
            _name = val;
        }
    });
    
    Object.defineProperty(layer, 'map', {
        get: function() {
            return _map;
        },
        set: function(val) {
            _map = val;
        }
    });
    
    Object.defineProperty(layer, 'opacity', {
        get: function() {
            return opacity;
        },
        set: function(val) {
            opacity = val;
            layer.refresh();
        }
    });
    
    Object.defineProperty(layer, 'visible', {
        get: function() {
            return visible;
        },
        set: function(val) {
            visible = val;
            layer.refresh();
        }
    });
    
    /* exposed: */
    layer.refresh = refresh;  
    layer.moveUp = moveUp;
    layer.moveDown = moveDown;
    layer.addTo = addTo;

    /* private: */
    layer._onAdd =  function(map){ //Adds the layer to the given map object
        _map = map;
        drawboard = _map.svg.append('g');
    };
    layer._onRemove = function(){ //Removes the layer from the map object
    };
    
    return layer;
};
;  /**
	 
  **/
  d3.mappu.VectorLayer = function(name, config){
      return d3_mappu_VectorLayer(name, config);
  };
  
  d3_mappu_VectorLayer = function(name, config) {
	  var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      var layertype = 'vector';
      var _data = [];
	  var drawboard;
	  
      /* exposed properties*/
      Object.defineProperty(layer, 'data', {
        get: function() {
            return _data;
        },
        set: function(array) {
            _data = array;
            draw(true);
        }
      });
      
      var draw = function(rebuild){
          var drawboard = layer.drawboard;
          if (rebuild){
               drawboard.selectAll('.entity').remove();
          }
          var entities = drawboard.selectAll('.entity').data(_data);
          
          var newpaths = entities.enter().append('path').attr("d", layer.map.path)
            .classed('entity',true).classed(name, true);
          // Add events from config
          if (config.events){
              config.events.forEach(function(d){
                 newpaths.on(d.event, d.action);
              });
          }
          layer.refresh();
      };
      
      var refresh = function(){
          var zoombehaviour = layer.map.zoombehaviour;
          layer.drawboard.style('opacity', this.opacity).style('display',this.visible?'block':'none');
          if (config.reproject){
              var entities = drawboard.selectAll('.entity');
              entities.attr("d", mypath);
          }
          else {
            layer.drawboard
              .attr("transform", "translate(" + zoombehaviour.translate() + ")scale(" + zoombehaviour.scale() + ")")
              .style("stroke-width", 1 / zoombehaviour.scale());
          }
      };
      
      /* Exposed functions*/
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_VectorLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  ;  /**
	 
  **/
  d3.mappu.RasterLayer = function(name, config){
      return d3_mappu_RasterLayer(name, config);
  };
  
  d3_mappu_RasterLayer = function(name, config) {
      var self = this;
      d3_mappu_Layer.call(this,name, config);
      var layer = d3_mappu_Layer(name, config);
      var layertype = 'raster';
      var drawboard;
      var _url = config.url;
      
      Object.defineProperty(layer, 'url', {
        get: function() {
            return _url;
        },
        set: function(val) {
            _url = val;
            draw();
        }
      });
      
      
      //Clear all tiles
      layer.clear = function(){
      };
      
      //Draw the tiles (based on data-update)
      var draw = function(){
         var drawboard = layer.drawboard;
         var tiles = layer.map.tiles;
         drawboard.attr("transform", "scale(" + tiles.scale + ")translate(" + tiles.translate + ")");
         var image = drawboard.selectAll(".tile")
            .data(tiles, function(d) { return d; });
         var imageEnter = image.enter();
         imageEnter.append("image")
              .classed('tile',true)
              .attr("xlink:href", function(d) {
                var url = "";
                url = _url    
                    .replace('{s}',["a", "b", "c", "d"][Math.random() * 4 | 0])
                    .replace('{z}',d[2])
                    .replace('{x}',d[0])
                    .replace('{y}',d[1])
                    //FIXME: why are these curly brackets killed when used with polymer?
                    .replace('%7Bs%7D',["a", "b", "c", "d"][Math.random() * 4 | 0])
                    .replace('%7Bz%7D',d[2])
                    .replace('%7Bx%7D',d[0])
                    .replace('%7By%7D',d[1]);
                return url;
              })
              .attr("width", 1)
              .attr("height", 1)
              .attr('opacity', self._opacity)
              .attr("x", function(d) { return d[0]; })
              .attr("y", function(d) { return d[1]; });
         image.exit().remove();
      };
      
      var refresh = function(){
          draw();
          layer.drawboard.style('opacity', this.opacity).style('display',this._display);
      };
      
      layer.refresh = refresh;
      layer.draw = draw;
      return layer;
  };
  
  d3_mappu_RasterLayer.prototype = Object.create(d3_mappu_Layer.prototype);
  
  