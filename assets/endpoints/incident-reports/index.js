
const list	   = require('../../utilities/list.js');
const ses      = require('../../utilities/ses.js');
const alexandria = require('/var/server/assets/connections/library/alexandria/index.js');
const staffportal = require('/var/server/assets/connections/tnrd/staffportal/index.js');
const sierra   = require('/var/server/assets/connections/library/sierra/index2.js');
const hub      = require('/var/server/assets/endpoints/hub-console/index.js');
const ils = require('/var/server/assets/endpoints/library/ils.js');
const mongoose = require('mongoose');
const fs = require("fs");
const moment = require("moment");

// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'614b4cfc87ef2608f2f0d082'},notice:{tnrd:'61eaee3ff0a2007eb2419c04'}},

	init : function(r){


		r.db = mongoose.createConnection(process.env.mongo'+hub-incident-reports',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models.items   = models.items(r.db);
		r.models.global_settings = models.global_settings(r.db);
		r.models.tnrd_settings = models.tnrd_settings(r.db);
		r.models.tnrl_settings = models.tnrl_settings(r.db);
		r.models.tnrd_incidents = models.tnrd_incidents(r.db);
		r.models.tnrl_incidents = models.tnrl_incidents(r.db);
		
		r.hub = hub;
		r.hub.init(hub);
		r.alexandria = alexandria;
		
		r.ses = ses.init(ses);
		

	},

//	ITEMS

	items : {

	},

//	SETTINGS 

	settings : {
		
		get :{
			all  : async function(r,c){
				var items = await r.models.settings.find().lean();
				return c?c(items[0]):items; 
			},
			administrators : async function(r,c){
				r.hub.users.get.all(hub,c);
			}
		},


		global : {

			get : {

				all  : async function(r,c){
					var items = await r.models.global_settings.find().lean();
					return c?c(items[0]):items; 
				},
			},

			update : async function(r,p,c){
			
				
				var res   = await r.models.global_settings.updateOne({_id:p._id},p);

				var roles = await r.hub.roles.get.byApplication(r.hub,r.conf.application.id);
				var role;
				
				roles.map(item=>{item.name==="Admin"?role=item._id:null;});
				
				p.administrators?p.administrators.map(async item=>{
					var params = {application:r.conf.application.id,user:item,role:role}
					let _res = await r.hub.users.update.role(r.hub,params);
				}):null; 
				
				c(res);
		
			},
			_update : async function(r,p,c){
			
				
				
		
			},
		},
		tnrd : {
		
			get : {

				all  : async function(r,c){
					var items = await r.models.tnrd_settings.find().lean();
					return c?c(items[0]):items[0]; 
				},
			},

			insert  : async (r,p,c)=>{
				let tnrd_settings = new r.models.tnrd_settings(p);
				let res  = await tnrd_settings.save();
				return c?c(res):res;
			},

			update : async function(r,p,c){
			
				var res   = await r.models.tnrd_settings.updateOne({_id:p._id},p);
				c(res);
		
			},
			delete  : async function(r,p,c){
			}
		},
		tnrl : {
			get : {

				all  : async function(r,c){
					var items = await r.models.tnrl_settings.find().lean();
					return c?c(items[0]):items; 
				},
			},

			insert  : async (r,p,c)=>{
				let tnrl_settings = new r.models.tnrl_settings(p);
				let res  = await tnrl_settings.save();
				return c?c(res):res;
			},

			update : async function(r,p,c){
			
				var res   = await r.models.tnrl_settings.updateOne({_id:p._id},p);
				c(res);
		
			},
			delete  : async function(r,p,c){}

		}

		
	},
//	INCIDENTS 

	incidents : {
		
		tnrd : {
			list : async function (r,p,c){
					var params = {
					search : {
						value:p.search,
						model:r.models.tnrd_incidents,
						fields:['name']                 
					}
				};
		
				let incidents = await list.query(list,params);

				return c?c(incidents):incidents;
			},
			get : {

				all  : async function(r,c){
					var items = await r.models.tnrd_incidents.find().lean();
					return c?c(items[0]):items; 
				},
				byId : async function(r,p,c){
					var res  = await r.models.tnrd_incidents.findById(p).lean();
					return c?c(res):res;
				},
			},

			insert  : async (r,p,c)=>{
				let incidents = new r.models.tnrd_incidents(p);
				let res  = await incidents.save();

				//	send notice
				let settings   = await r.settings.tnrd.get.all(r);
				let issuer     = await r.hub.users.get.byId(r.hub,p.issuer);
				let committee  = parseInt(p.committee)?'recipients-bcgeu':'recipients-cupe';
				
				params         = {users:settings[committee]};
				params.replace = [
					["$name",issuer.profile.name],
					["$type",settings["general-types"][parseInt(p["type-general"])].name],
					["$details",p.description],
					["$link","/incident-reports/admin/incidents/tnrd/details/"+res._id.toString()]
				]
		
				let notice_res = await r.hub.notices.send(r.hub,[r.conf.notice.tnrd,params]);
				
				return c?c(res):res;
			},

			update : async function(r,p,c){
				var res   = await r.models.tnrd_incidents.updateOne({_id:p._id},p);
				c(res);
			},
			delete  : async function(r,p,c){
				var res = await r.models.tnrd_incidents.deleteOne({_id:p}).lean();
				res.code=1
				c(res);
			}
		},
		
		tnrl : {
			list : async function (r,p,c){
				var params = {
					search : {
						value:p.search,
						model:r.models.tnrl_incidents,
						fields:['name']                 
					}
				};
		
				let incidents = await list.query(list,params);

				return c?c(incidents):incidents;
			},
			get : {

				all  : async function(r,c){
					var items = await r.models.tnrl_incidents.find().lean();
					return c?c(items[0]):items; 
				},
				byId : async function(r,p,c){
					var res  = await r.models.tnrl_incidents.findById(p).lean();
					return c?c(res):res;
				},
			},

			insert  : async (r,p,c)=>{
				
			// 	save record
				let incidents = new r.models.tnrl_incidents(p);
				let res  = await incidents.save();

			
				return c?c(res):res;
			},

			update : async function(r,p,c){
				var res   = await r.models.tnrl_incidents.updateOne({_id:p._id},p);
				c(res);
			},
			delete  : async function(r,p,c){
				var res = await r.models.tnrl_incidents.deleteOne({_id:p});
				res.code=1
				c(res);
			}

		}

		
	}
	
	
}