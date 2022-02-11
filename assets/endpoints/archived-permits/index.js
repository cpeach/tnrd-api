
const list	   = require('../../utilities/list.js');
const staffportal = require('/var/server/assets/connections/tnrd/staffportal/index.js')
const mongoose = require('mongoose');
const fs = require("fs");
const moment = require("moment");

// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'61f44991e2c12c5873a888c2'}},

	init : function(r){

		r.db = mongoose.createConnection(process.env.mongo+'hub-archived-permits',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models.planning_records = models.planning_records(r.db);
		r.models.building_records = models.building_records(r.db);
		r.models.tnrd_planning_records = models.tnrd_planning_records(r.db);

		
	},


//	RECORDS 
	records : {
		
	//	building
		building : {
			search : {
				count  : async (r,p,c)=>{
					let query = {}
					for(let d in p.data){
						query[d] = { "$regex": p.data[d], "$options": "i" }
					}
					var items = await r.models.building_records.find(query).lean();
					c(items.length);
				},
				all  : async (r,p,c)=>{
					let query = {}
					for(let d in p.data){
						query[d] = { "$regex": p.data[d], "$options": "i" }
					}
					var items = await r.models.building_records.find(query).lean();
					c(items);
				},
				
			},
			get : {

				all  : async function(r,c){
					var items = await r.models.building_records.find().lean();
					return c?c(items[0]):items; 
				},
				byId : async function(r,p,c){
					var res  = await r.models.building_records.findById(p).lean();
					return c?c(res):res;
				},
			},

			delete  : async function(r,p,c){
				var res = await r.models.building_records.deleteOne({_id:p}).lean();
				res.code=1
				c(res);
			}
		},

	//	planning		
		planning : {
			search : {
				count  : async (r,p,c)=>{
					let query = {}
					for(let d in p.data){
						query[d] = { "$regex": p.data[d], "$options": "i" }
					}
					var items = await r.models.planning_records.find(query).lean();
					c(items.length);
				},
				all  : async (r,p,c)=>{
					let query = {}
					for(let d in p.data){
						query[d] = { "$regex": p.data[d], "$options": "i" }
					}
					var items = await r.models.planning_records.find(query).lean();
					c(items);
				},
				
			},
			get : {

				all  : async function(r,c){
					var items = await r.models.planning_records.find().lean();
					return c?c(items[0]):items; 
				},
				byId : async function(r,p,c){
					var res   = await r.models.planning_records.findById(p).lean();
					var apps  = await r.models.tnrd_planning_records.find({"pcs_link":res["pcs_link"]}).lean();
					res.apps = apps;
					return c?c(res):res;
				},
			},

			delete  : async function(r,p,c){
				var res = await r.models.planning_records.deleteOne({_id:p}).lean();
				res.code=1
				c(res);
			}
		}

		
	}
	
	
}