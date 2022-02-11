
const list	   = require('../../utilities/list.js');
const ses      = require('../../utilities/ses.js');
const alexandria = require('/var/server/assets/connections/library/alexandria/index.js');
const sierra   = require('/var/server/assets/connections/library/sierra/index2.js');
const hub      = require('/var/server/assets/endpoints/hub-console/index.js');
const mongoose = require('mongoose');
const fs = require("fs");
const moment = require("moment");

// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'60e877ca1df0680bcd41f2ad'}},

	init : function(r){

		r.db = mongoose.createConnection(process.env.mongo+'hub-expiring-patrons',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models.notified  = models.notified(r.db);
		r.models.settings  = models.settings(r.db);
		r.models.templates = models.templates(r.db);

		r.hub = hub;
		r.hub.init(hub);
		r.alexandria = alexandria;
		r.sierra = sierra;
		r.ses = ses.init(ses);

	},

//	EXPIRING

	expiring : {
		
		list :  async (r,p,c)=>{

			let filters = p.filters;

			let templates = await r.templates.get.all(r);
			let settings  = await r.settings.get.all(r);
			settings = settings[0];
			
			var query = "SELECT record_num as id FROM sierra_view.patron_view " + 
		   				"where expiration_date_gmt BETWEEN (CURRENT_TIMESTAMP + "+settings.range+" * interval '1 day') and "+
						"((CURRENT_TIMESTAMP + "+settings.range+" * interval '1 day') + "+settings.window+" * interval '1 day') and home_library_code not like 'ly' and ptype_code IN ("+settings.types.join()+")";
			
/* 			var query = "SELECT record_num as id FROM sierra_view.patron_view " + 
					"where expiration_date_gmt BETWEEN (CURRENT_TIMESTAMP + 20 * interval '1 day') and " +
					"((CURRENT_TIMESTAMP + 20 * interval '1 day') + 7 * interval '1 day') and home_library_code not like 'ly' and ptype_code IN (11)" */

			r.alexandria.query(r,[query],async (p)=>{
				var ids  = p[0].map(item=>(item.id));
				var path = "/patrons/?limit=500&id="+ids.join()+"&fields=emails,names,expirationDate,id,patronType"
				var res   = await r.sierra.request({method:'GET',path:path});

				if(res.entries.length == 0){
					c({code:2,error:'No patrons'});
				}
				
				let patrons = res.entries;

				var valididate = (email)=>{
					const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return re.test(String(email).toLowerCase());
				}

				var group = (type)=>{
						let group = {};
						templates.map((item)=>{
							group = item.types.includes(type.ptype_id) ? item : group;
						})
						return group;
				}

				var type = (p,patron)=>{
					let type;
					p.map(item=>{
						if(item.ptype_id===patron.patronType){
							type = item;
						}
					})
					return type;
				}

				var name = (fullname)=>{
					if(!fullname.includes(',')){return fullname;}

					var name = fullname.toLowerCase().split(',');	
					var propername = name.map(n=>{
						return n.toLowerCase().trim().split(' ').map(pn => pn.charAt(0).toUpperCase() + pn.slice(1)).join(' ');
					})

					return propername.reverse().join(' ');
				}

				var types = await r.settings.get.types(r,(p)=>{
					
					patrons = patrons.map(patron => (
						{
							name: patron.names?name(patron.names[0]):null, 
							patron_id: patron.id, 
							email: patron.emails?patron.emails[0]:null, 
							valid_email: patron.emails?valididate(patron.emails[0]):false,
							template:group(type(p,patron)),
							expiration:patron.expirationDate, 
							type: type(p,patron).name
						}
					));
					
					let filtered=[],templates=[]
					if(filters){
						filters.template!==undefined ? patrons.map(item=>{if(item.template._id==filters.template){templates.push(item)}}) : null;

						if(filters.valid!==undefined){
							if(filters.template){
								templates.map(item=>{if(item.valid_email===filters.valid){filtered.push(item)}}) ;
							}else{
								patrons.map(item=>{if(item.valid_email===filters.valid){filtered.push(item)}});
							}
							c(filtered)
						}else{
							c(templates)
						}
						
					}else{
						c(patrons)
					}					
				});



			})
		},
		get : {

			all  : async function(r,c){
				
			},
			byId : async function(r,p,c){
				let id = p;
				var path = "/patrons/"+id+"?&fields=emails,names,expirationDate,id,patronType,addresses,phones";
				var res   = await r.sierra.request({method:'GET',path:path});
				let patron = {
							name: res.names?res.names[0]:null, 
							patron_id: res.id, 
							phone:res.phones?res.phones[0].number:null,
							email: res.emails?res.emails[0]:null, 
							expiration:res.expirationDate
							//address:res.addresses[0].lines.join(' ')
						}
				c(patron);
			},
			summary: async function(r,c){

				let summary = {date_from:"",date_to:"",items:[],groups:{},administrators:[]} 
				
				let templates = await r.templates.get.all(r);
				let settings  = await r.settings.get.all(r);
				settings = settings[0];
 
				var current = new Date();
				summary.date_from  = moment(current.setDate(new Date().getDate() + parseInt(settings.range))).format('dddd LL');
				current = new Date();
				summary.date_to = moment(new Date().setDate(current.getDate() + parseInt(settings.window) + parseInt(settings.range))).format('dddd LL');

				settings.administrators?settings.administrators.map(async (item,i)=>{
					summary.administrators.push(await r.hub.users.get.byId(hub,item));
				}):null

				r.expiring.list(r,{},async(p)=>{
					templates.map((item)=>{
						summary.groups[item._id] = {name:item.name,valid:0,invalid:0}	
					})
					p.map(item=>{
						if(item.valid_email){
							summary.groups[item.template._id].valid++;
							summary.items.push(item);
						}else{
							summary.groups[item.template._id].invalid++;
						}
					})

					// ** TODO: Using the latest date of batch records and the notificaion range, determine if notifications have
					//	  already been sent.

					r.notified.notificationRangeExists(r,{date_from:summary.date_from,date_to:summary.date_to},async(p)=>{
						summary.notifications_sent = p;
						return c?c(summary):summary;
					});

				});

			},
		
			
		},
		notify : async function(r,c){
		
			r.expiring.get.summary(r,async(summary)=>{

				let results=[],patrons=[],notices=[];
				let settings  = await r.settings.get.all(r);
				settings = settings[0];

				const sleep = (ms)=>{return new Promise(resolve => setTimeout(resolve, ms));}

				// splice admin
				summary.items.push({...summary.items[0]});
				summary.items.push({...summary.items[0]});

				summary.items[summary.items.length-1].name = "Cory Peach"
				summary.items[summary.items.length-1].email = "cpeach@tnrd.ca"

				summary.items[summary.items.length-2].name = "Jesse Phillips"
				summary.items[summary.items.length-2].email = "jphillips@tnrd.ca"


				summary.items.map(async (item,i)=>{
						let params  = {subject: settings.email_subject,source : settings.email_source}
						params.to   = [item.email];
						params.body = item.template.content.replace("replacename",item.name);
						delete item.template;
						params.patron = item;
						notices.push(params);
				})
				
				const batch =  Array.from({ length: Math.ceil(notices.length / 100) }, (v, i) => notices.slice(i * 100, i * 100 + 100))
				
				for(let i=0;i<batch.length;i++){
					batch[i].map( async item=>{
						var patron = {...item.patron};
						delete item.patrons;
						let result = await r.ses.send(r.ses,item)
						//let result = 'test';
						patron.result = result;
						patrons.push(patron);
						
					});
					await sleep(1000);
				}

				var res = await r.notified.insert(r,{patrons:patrons,date_from:summary.date_from,date_to:summary.date_to});

				c(res);
			});
		
		},

		bouncetest : async function(r,c){

			let settings = await r.settings.get.all(r);
			settings = settings[0];
			let params  = {subject: settings.email_subject,source : settings.email_source}
			params.to   = ["this_isa_test@bouncetest.ca"];
			params.body = "<html><body><div>test</div></body></html>";

			//let result = await r.ses.send(r.ses,params)	
		
			c(result);
		
		},

		update  : async function(r,p,c){
          var id = p.id;
          var email = p.email;
          var patronPatch = {
            emails : [email]
          };

		  var path = "/patrons/"+id;
		  var params = { method:'PUT',path:path,headers:{'Content-Type':'application/json'},body:JSON.stringify(patronPatch)}
		  var res   = await r.sierra.request(params);
            if (res == ''){
              return c({code:0});
            } else {
              return c({code:1, error:res.name});
            } 
	
		}
		
		
	},

//	NOTIFIED

	notified : {
		
		list :  async (r,p,c)=>{
			
			let notified = await r.models.notified.find({});
			c(notified);
		},
		get : {

			all  : async function(r,c){
				var items = await r.models.notified.find({});
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.notified.findById(p).lean();
				c(res);
			},
			patrons  : async function(r,p,c){
				var items = await r.models.notified.findById(p);
				c(items.patrons); 
			},
		},
		notificationRangeExists  : async function(r,p,c){
			var items = await r.models.notified.exists({date_from:p.date_from,date_to:p.date_to});
			c(items); 
		},
		insert  : async function(r,p,c){
			
			let notified = new r.models.notified(p);
			let res  = await notified.save();
			return c?c(res):res;
					
		},
		update  : async function(r,p,c){

			var res = await r.models.notified.updateOne({_id:p._id},p);
			c(res);
	
		},
		delete  : async function(r,p,c){
						
		}
		
	},

//	TEMPLATES 

	templates : {
		
		list :  async (r,p,c)=>{
			var items = await r.models.templates.find().lean();
			return c?c(items):items; 
		},
		get : {
			all  : async function(r,c){
				var items = await r.models.templates.find().lean();
				return c?c(items):items; 
			},
			byId : async function(r,p,c){
				var res  = await r.models.templates.findById(p).lean();
				c(res);
			}
		},
		insert  : async function(r,p,c){
			
			let templates = new r.models.templates(p);
			let res  = await templates.save();
			c(res);
					
		},
		update  : async function(r,p,c){
			var res = await r.models.templates.updateOne({_id:p._id},p);
			c(res);
		},
		delete  : async function(r,p,c){}
		
	},
	
//	SETTINGS 

	settings : {
		
		
		get : {

			all  : async function(r,c){
				var items = await r.models.settings.find().lean();
				return c?c(items[0]):items; 
			},
			types : async function(r,c){
				var query = `SELECT pn.ptype_id - 1 as ptype_id, pn.description as name FROM sierra_view.ptype_property_name pn`;
				r.alexandria.query(r,[query],async (p)=>{
					let types = p[0];
					c(types);
				})
			},
			administrators : async function(r,c){
				r.hub.users.get.all(hub,c);
			}
		},

		update : async function(r,p,c){
		
			var res  = await r.models.settings.updateOne({_id:p._id},p);
			var roles = await r.hub.roles.get.byApplication(r.hub,r.conf.application.id);
			var role;
			
			roles.map(item=>{item.name==="Admin"?role=item._id:null;});
			
			p.administrators?p.administrators.map(async item=>{
				var params = {application:r.conf.application.id,user:item,role:role}
				let _res = await r.hub.users.update.role(r.hub,params);
			}):null; 
			
			c(res);
	
		},
		delete  : async function(r,p,c){
						
		}
		
	},
	
	
	
	
}