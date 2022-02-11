
const list	   = require('../../utilities/list.js');
const ses      = require('../../utilities/ses.js');
const excel    = require('../../utilities/excel.js');
const sierra   = require('/var/server/assets/connections/library/sierra/index2.js');
const hub      = require('/var/server/assets/endpoints/hub-console/index.js');
const index    = require('./index.js');  // endpoints
const mongoose = require('mongoose');
const fs = require("fs");
const moment  = require("moment");
// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'614a68613bafb8636aa35152'}},

	init : function(r){

		r.db = mongoose.createConnection(process.env.mongo+'hub-hashad',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		
		r.models.stats = models.stats(r.db);

		/*r.index = index;
		r.index.init(index);*/

		r.hub = hub;
		r.hub.init(hub);
		r.sierra = sierra;
		r.ses = ses.init(ses);

	},

//	

	items : {

		list : async (r,p,c)=>{
			
			var res = await hub.reports.list(hub,{filters:{app:r.conf.application.id}});
			c(res);
		},

		get : {
			all  : async(r,c)=>{ c({})},
			byId : async(r,p,c)=>{
				var res = await hub.reports.get.byId(hub,p);
				c(res);
			}
		},

		query : async(r,p,c)=>{

			c({})
		},

		map : {
			categories : (r,p)=>{
				return c({});
			},
			values : (r,p)=>{
				return c({});
			},
		},

		build : async(r,p,c)=>{
			return c({});
		},

		update : async (r,p,c)=>{
			/* p.ref = r.conf.application.id;
			let workbook = await r.items.build(r,p.parameters);
			p.workbook = workbook;
			hub.reports.put(hub,p,(p)=>{c(p)}); */
		},
		insert : async (r,p,c)=>{
/* 			p.ref = r.conf.application.id;
			p.workbook = await r.items.build(r,p.parameters);
			hub.reports.post(hub,p,(p)=>{c(p)}); */
		},
	},


	
	
}