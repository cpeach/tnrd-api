//ILS

const arcgis = require('/var/server/assets/connections/gis/index.js');

module.exports = {
	
	data : {},
	
	init : function(r){
		r.arcgis     = arcgis;
		r.arcgis.init(r.arcgis);
	},
	
	
/*	SET*/	
	set : {
		
	
	},
	
/*	GET*/		
	get : {
    library :{
      branches : function(r,p,c){

        var params = 
			'where=LibType+%3D+%27Library%27'+
			'&f=pjson'+
			'&outFields=*';
        var o = {method:'POST',path:'/ags/rest/services/Basemap_Cache_Detail/MapServer/55/query?'};
				r.arcgis.request(r.arcgis,[o,params],function(p){
          c(p[0]);
        });
      }
    }
    

	},
	
/*	LET*/	
	let : {}
	
}