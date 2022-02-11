
const cognito  = require('../../../utilities/cognito.js');
const mongoose = require('mongoose');
const sierra   = require('/var/server/assets/connections/library/sierra/index2.js');
const alexandria = require('/var/server/assets/connections/library/alexandria/index.js');

// MODELS

const models = require('./models.js');

module.exports = {
	
	data : {
		
		mongo:{
			db:'tnrd-lib-expiring',
			options : {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true}
		},
		
		
	},  
	
	init : function(r){

		r.db = mongoose.createConnection(process.env.mongo+r.data.mongo.db,r.data.mongo.options);
		
		r.sierra = sierra;
		r.alexandria = alexandria;
		
		r.alexandria.init(r.alexandria);

		r.models = {};
		r.models.user = models.user(r.db);
		
		r.accounts = {
			path:"https://api.tnrdit.ca/accounts"
		};
		
	},
	
//	Validate
	validate : {
		get : async function(r,p,c){
			var params = {method:'POST',path:'/patrons/validate',body:{barcode:p.barcode,pin:p.pin}};
			c(await r.sierra.request(params));
		},
		
	},
	
//	PATRONS
	patrons:{ 
		query : async function(r,p,c){

			var query = "SELECT record_num as id FROM sierra_view.patron_view " + 
		   				"where expiration_date_gmt BETWEEN (CURRENT_TIMESTAMP + 20 * interval '1 day') and "+
						"((CURRENT_TIMESTAMP + 20 * interval '1 day') + 7 * interval '1 day') and ptype_code IN ("+p.join()+")";
			
			r.alexandria.query(r,[query],async (p)=>{
				var ids  = p[0].map(item=>(item.id));
				var path = "/patrons/?limit=500&id="+ids.join()+"&fields=barcodes,emails,names,phones,addresses,expirationDate,id,patronType"
				var res  = await r.sierra.request({method:'GET',path:path});
				return c(res);
			})	
		}
	}	
	
	
	
}