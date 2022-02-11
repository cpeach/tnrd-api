
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
const schedule = require('node-schedule');

// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'614a68613bafb8636aa35152'}},

	init : function(r){

		r.db = mongoose.createConnection(process.env.mongo'+hub-hashad',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models.hashad   = models.hashad(r.db);
		r.models.patrons   = models.patrons(r.db);
		r.models.settings  = models.settings(r.db);
		r.models.formats  = models.formats(r.db);
		r.models.authors  = models.authors(r.db);
		r.models.subjects  = models.subjects(r.db);
		r.models.checkouts = models.checkouts(r.db);
		r.models.temp_checkouts = models.temp_checkouts(r.db);

		r.hub = hub;
		r.hub.init(hub);
		r.alexandria = alexandria;
		r.sierra = sierra;
		r.ses = ses.init(ses);
		r.ils = ils;
		r.ils.init(ils);

		hashad_job = schedule.scheduleJob('0 0 3 * * 1', async function(fireDate){
			var query = await r.hashad.query(r,[]);
		});
	},

//HASHAD 

	hashad : {
		query : async function(r,p,c){
			var lastquery = await r.hashad.get.latest(r,[]);
			var dt = moment(new Date()).startOf('day');;
			//use this to specify an exact date
			//var df = moment(dt).subtract(14,'d');
			var df = moment(lastquery[0].dateTo).add(1,'d');

			if(new Date(df).getTime() >= new Date(dt).getTime()){
				var params = {};
						
				params.replace = [
							["$df",df.format('DD-MM-YYYY')],
							["$dt",dt.format('DD-MM-YYYY')]
							];

				

				let notice_res = await r.hub.notices.send(r.hub,['61f04d47f69e44237a19ad5f',params]);

				return c?c(false):false;
			}

			var q = {
				"queries": [
					{
					"target": {
						"record": {
						"type": "item"
						},
						"id": 63
					},
					"expr": {
						"op": "between",
						"operands": [
						df.format('DD-MM-YYYY'),
						dt.format('DD-MM-YYYY')
						]
					}
					},
					"and",
					[
					{
						"target": {
						"record": {
							"type": "patron"
						},
						"id": 47
						},
						"expr": {
						"op": "equals",
						"operands": [
							"40",
							""
						]
						}
					},
					"or",
					{
						"target": {
						"record": {
							"type": "patron"
						},
						"id": 47
						},
						"expr": {
						"op": "equals",
						"operands": [
							"41",
							""
						]
						}
					},
					"or",
					{
						"target": {
						"record": {
							"type": "patron"
						},
						"id": 47
						},
						"expr": {
						"op": "equals",
						"operands": [
							"42",
							""
						]
						}
					}
					]
				]
				};

						var params = {
							limit:1000,
							offset:0,
							body: q
						}

						var o = {method:'POST',path:'/items/query?limit='+params.limit+'&offset='+params.offset+'',body : params.body};
						var items = await r.sierra.request(o);
						var recordid = [];
						for (var i=0;i<items.entries.length;i++){
							var link = items.entries[i].link;
							var arr = link.split("/");
							recordid[recordid.length] = arr[arr.length - 1];
						}

						var params = {
							dateFrom : new Date(df.format()),
							dateTo : new Date(dt.format()),
							results : recordid
						}

						var insert = await r.hashad.insert(r,params);
						var o = {method:'GET',path:'/items/?limit=1000&id='+recordid.join()+'&fields=default,fixedFields,varFields'};
						var records = await r.sierra.request(o);
						for (let i = 0; i < records.entries.length; i++) {
							var patron = await r.models.patrons.find({pid:records.entries[i].fixedFields['66'].value});
							if(patron[0]){

								var checkout = {
									date:new Date(records.entries[i].fixedFields['63'].value),
									bibid:parseInt(records.entries[i].bibIds[0]),
									patron:patron[0]._id,
									item:records.entries[i].barcode
								};

								var insert = await r.checkouts.insert(r,checkout);

							}

						}

						var params = {};
						
						params.replace = [
							["$df",df.format('DD-MM-YYYY')],
							["$dt",dt.format('DD-MM-YYYY')],
							["$recordsFound",records.entries.length]
							];
						
						let notice_res = await r.hub.notices.send(r.hub,['61eef2b23a70ff1991064915',params]);
						
						var ret = {
							recordsFound:records.entries.length,
							df:df.format('DD-MM-YYYY'),
							dt:dt.format('DD-MM-YYYY')
						}
						return c?c(ret):ret;
						//c(true);

		},
		list :  async (r,p,c)=>{
				var params = {
					search : {
						value:p.search,
						model:r.models.hashad,
						fields:['name']                 
					}
				};
		
				let items = await list.query(list,params);
				c(items); 
		},
		get  : {

			all  : async function(r,c){
					var items = await r.models.hashad.find({});
					return c?c(res):res;
			},
			byId : async function(r,p,c){
					var res  = await r.models.hashad.findById(p).lean();
					c(res);
			},
			latest : async function(r,p,c){
				var item = await r.models.hashad.find().sort({ _id: -1 }).limit(1).lean();
				return c?c(item):item;
			}
		},
		update  : async (r,p,c)=>{
				var res = await r.models.hashad.updateOne({_id:p._id},p);
				c(res);
		},
		insert  : async (r,p,c)=>{
				let hashad = new r.models.hashad(p);
				let res  = await hashad.save();
				return c?c(res):res;
		},
		delete  : async (r,p,c)=>{},
	},
//	PATRONS

	patrons : {

		list :  async (r,p,c)=>{
		
			var params = {
               search : {
                   value:p.search,
                   model:r.models.patrons,
                   fields:['name']		
               }
            };

			/* 			
			if(p.filters){
				p.filters.type ? params.filters.push({reference:'type',value:p.filters.type}) : null
			} */

			let items = await list.query(list,params);
			
			for(var i=0;i<items.length;i++){
				//var subjects = await r.subjects.all(r});
			}
			
			c(items); 	
		},
		get  : {
			all  : async function(r,c){
				var items = await r.models.patrons.find({});
				return c?c(items):items;
			},
			byId : async function(r,p,c){
				var patron  = await r.models.patrons.findById(p).lean();
				c(patron);
			},
			history : async function(r,p,c){
				var res  = await r.models.checkouts.find({patron:p});
				c(res);
			},
			pid : async function(r,p,c){
				var items = await r.models.patrons.find({});
	
				var l = 500;
				var off = 0;
				var expr = {
						"op": "equals",
						"operands": []
					}
						
				for (let i = 0; i < items.length; i++) {
						
						var body = {
						"queries": [
								{
								"target": {
									"record": {
									"type": "patron"
									},
									"field": {
									"tag": "b"
									}
								},
								"expr": []
								}
							]
						}

						var expr_ = JSON.parse(JSON.stringify(expr)); 
						expr_.operands[0] = String(items[i].barcode);
						body.queries[0].expr[body.queries[0].expr.length] = expr_;

						var o = {method:'POST',path:'/patrons/query?limit='+l+'&offset='+off+'',body : body};
						var patron = await r.sierra.request(o);
						if(patron.total > 0){
							var link = patron.entries[0].link;
							var arr = link.split("/");
							var params = {
								_id:items[i]._id,
								pid:arr[arr.length-1]
							}

							var res = await r.models.patrons.updateOne({_id:params._id},params);
							console.log(res);
						}
				}

				return c?c(true):true;
			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.patrons.updateOne({_id:p._id},p);
			return c?c(res):res;
			},
		insert  : async (r,p,c)=>{
			let patrons = new r.models.patrons(p);
			let res  = await patrons.save();
			c(res);
		},
		delete  : async (r,p,c)=>{
			var res = await r.models.patrons.deleteOne({_id:p});
			res.code=1
			c(res);
		},
	},

// 	CHECKOUTS

	checkouts : {

		list :  async (r,p,c)=>{
			var params = {
               search : {
                   value:p.search,
                   model:r.models.checkouts,
                   fields:['name']                 
               }
           };

		   if(p.filters){
				p.filters.patron ? params.filters.push({reference:'patron',value:p.filters.patron}) : null
			} 
 
           let items = await list.query(list,params);

		   c(items); 
		},
		get  : {
			all  : async function(r,c){
				var items = await r.models.checkouts.find({});
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.checkouts.findById(p).lean();
				c(res);
			},
			byPatron : async function(r,p,c){
				var items  = await r.models.checkouts.find({patron:p}).lean();
				
				if (items){
					var bibs = [];
					for (let i = 0; i < items.length; i++) {
						items[i].bibid ? bibs.push(items[i].bibid) : null;
					}
					console.log(bibs)
					r.ils.get.bibs.info(r.ils,[bibs],function(p){
						for (let i = 0; i < p.entries.length; i++) {
							const result = items.find( ({ bibid }) => bibid == p.entries[i].id);
							p.entries[i].checkoutdate = result.date;
							p.entries[i].barcode = result.item;
						}
						c(p);
					});

				} else {
					c(items);
				}

				

			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.checkouts.updateOne({_id:p._id},p);
			return c?c(res):res;
		},
		insert  : async (r,p,c)=>{
			let checkouts = new r.models.checkouts(p);
			let res  = await checkouts.save();
			return c?c(res):res;
		},
		delete  : async (r,p,c)=>{},
	},

// 	FORMATS

	formats : {
		list :  async (r,p,c)=>{
			var params = {
               search : {
                   value:p.search,
                   model:r.models.formats,
                   fields:['name']                 
               }
           };
 
           let items = await list.query(list,params);
		   c(items); 
		},
		get  : {
			all  : async function(r,c){
				var items = await r.models.formats.find({});
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.formats.findById(p).lean();
				c(res);
			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.formats.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let formats = new r.models.formats(p);
			let res  = await formats.save();
			c(res);
		},
		delete  : async (r,p,c)=>{},
	},

// 	SUBJECTS

	subjects : {
		list :  async (r,p,c)=>{
			var params = {
               search : {
                   value:p.search,
                   model:r.models.subjects,
                   fields:['name']                 
               }
           };
 
           let items = await list.query(list,params);

		   c(items); 
		},
		get  : {
			all  : async function(r,c){
				var items = await r.models.subjects.find({});
				return c?c(items):items; 
			},
			byId : async function(r,p,c){
				var res  = await r.models.subjects.findById(p).lean();
				c(res);
			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.subjects.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let subjects = new r.models.subjects(p);
			let res  = await subjects.save();
			c(res);
		},
		delete  : async (r,p,c)=>{},
	},

// 	AUTHORS

	authors : {
		list :  async (r,p,c)=>{
			var params = {
               search : {
                   value:p.search,
                   model:r.models.authors,
                   fields:['name']                 
               }
           };
 
           let items = await list.query(list,params);

		   c(items); 
		},
		get  : {
			all  : async function(r,c){
				var items = await r.models.authors.find({});
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.authors.findById(p).lean();
				c(res);
			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.authors.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let authors = new r.models.authors(p);
			let res  = await authors.save();
			c(res);
		},
		delete  : async (r,p,c)=>{},
		
		authors_temp : async (r,p,c)=>{
			var pats = await r.patrons.get.all(r);

			for (let i = 138; i < pats.length; i++) {
				console.log('patron '+i+ ' of '+pats.length);
				var items = await r.models.checkouts.find({patron:pats[i]._id}).lean();
				if (items){
					var barcodes = [];
					for (let i_ = 0; i_ < items.length; i_++) {
						if(new Date(items[i_].date).getTime() < new Date('1/13/2022').getTime()){
							barcodes[barcodes.length] = items[i_].item;
						}
					}

					var q = {
						"queries": [
							{
							"target": {
									"record": {
										"type": "item"
									},
									"field": {
										"tag": "b"
									}
								},
							"expr": [
								]
							}

						]
					};
					
					var expr = {
								"op": "equals",
								"operands": []
								}
						
					for (let i = 0; i < barcodes.length; i++) {
						var expr_ = JSON.parse(JSON.stringify(expr)); 
						expr_.operands[0] = barcodes[i];
						q.queries[0].expr[q.queries[0].expr.length] = expr_;
						q.queries[0].expr[q.queries[0].expr.length] = "or";
					}

					var params = {
							limit:500,
							offset:0,
							body: q
						}

        		var o = {method:'POST',path:'/items/query?limit='+params.limit+'&offset='+params.offset+'',body : params.body};
				console.log('sending item query');
				var its = await r.sierra.request(o);
				if(!its.entries){
					continue;
				}
				var recordid = [];
				for (let i__ = 0; i__ < its.entries.length; i__++) {
					var link = its.entries[i__].link;
					var arr = link.split("/");
					recordid[recordid.length] = arr[arr.length - 1];
				}

				var o = {method:'GET',path:'/items/?limit=1000&id='+recordid.join()+'&fields=default,fixedFields,varFields'};
				console.log('sending record query');
				var records = await r.sierra.request(o);
				for (let i__ = 0; i__ < records.entries.length; i__++) {
					var checkout = await r.models.checkouts.find({patron:pats[i]._id,item:records.entries[i__].barcode}).lean();
					if(!checkout[0]){
						continue;
					}
					checkout[0].bibId = records.entries[i__].bibIds[0];
					var par = {
						_id:checkout[0]._id,
						bibid:checkout[0].bibId
					}
					var update = await r.checkouts.update(r,par);
				}

				}

				if (i == pats.length - 1){
					c(true);
				}

			}
			
			
		}
	},

//	SETTINGS

	settings : {

		list :  async (r,p,c)=>{},
		get  : {
			all  : async (r,c)=>{
				var items = await r.models.settings.find().lean();
				return c?c(items[0]):items; 
			},
			administrators : async function(r,c){
				r.hub.users.get.all(hub,c);
			}
		},
		update  : async (r,p,c)=>{
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
		insert  : async (r,p,c)=>{},
		delete  : async (r,p,c)=>{},
	}	

	
	
}