
const list	   = require('../../utilities/list.js');
const ses      = require('../../utilities/ses.js');
const excel    = require('../../utilities/excel.js');
const staffportal = require('/var/server/assets/connections/tnrd/staffportal/index.js');
const hub      = require('/var/server/assets/endpoints/hub-console/index.js');
const index    = require('./index.js');  // endpoints
const stats_counter    = require('../stats-counter/index.js');  // endpoints
const mongoose = require('mongoose');
const fs = require("fs");
const moment  = require("moment");

// MODELS
const models = require('./models.js');


module.exports = {
	
	conf : {
		application:{id:'61faec3868493a1805f8f770'},
		months : {
			"01":"January",
			"02":"Febuary",
			"03":"March",
			"04":"April",
			"05":"May",
			"06":"June",
			"07":"July",
			"08":"August",
			"09":"September",
			"10":"October",
			"11":"November",
			"12":"December"
		}
	},

	init : function(r){

		r.db = mongoose.createConnection('mongodb://localhost/hub-tnrl-stats',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models = {};
		r.models.wifi_locations = models.wifi_locations(r.db);
		r.models.wifi_stats = models.wifi_stats(r.db);

		r.models.pc_res_locations = models.pcres_locations(r.db);
		r.models.pc_res_stats = models.pcres_stats(r.db);

		r.models.collection_types = models.collection_types(r.db);
		r.models.collection_stats = models.collection_stats(r.db);

		r.index = index;
		r.index.init(index);

		r.hub = hub;
		r.hub.init(hub);

		r.stats_counter = stats_counter;
		r.stats_counter.init(stats_counter);
		
	},

//	WIFI
	wifi : {

	//	usage
		usage : {
			get : {

				all : async(r,c)=>{
						var out = await hub.reports.list(hub,{filters:{app:r.conf.application.id,categories:['wifi','usage']}});
						c(out);
					}
				},

				query : async(r,p)=>{

				//	values			
					let values = await r.index.wifi.usage.list(r.index,{filters:{years:p.years,months:p.months,locations:p.locations}})
				
				//  columns
					let columns = [];
					for(let i=0;i<p.locations.length;i++){columns.push(await r.index.wifi.locations.get.byId(r.index,p.locations[i]));}
					
				// 	params 
					let params        = {title: "WIFI Usage Statistics"};
					
					params.columns    = columns.map(item=>({label:item.name,key:item.lib_id}));
					
					params.categories = p.years.map(item=>({label:'Year : '+item,key:item}))
					params.items = [];
					params.categories.map(category=>{
						params.items = params.items.concat(p.months.map(item=>({label:r.conf.months[item],parent:category.key,key:category.key+item})));
					});
					params.values	 = values.map(value=>({label:parseInt(value.usage),default:0,column:value.lib_id,parent:value.year+value.month}));				 

					return params;

				},

				build : async(r,p,c)=>{
					let params = await r.wifi.usage.query(r,p);
					let res = excel._make(excel,params); 
					return c?c(res):res;
				},

				update : async (r,p,c)=>{
					p.ref = r.conf.application.id;
					p.workbook = await r.wifi.usage.build(r,p.parameters);
					p.categories = ['wifi','usage'];
					hub.reports.put(hub,p,(p)=>{c(p)});
				}, 

				insert : async (r,p,c)=>{
					p.ref = r.conf.application.id;
					p.workbook = await r.wifi.usage.build(r,p.parameters);
					p.categories = ['wifi','usage'];
					hub.reports.post(hub,p,(p)=>{c(p)});
				
				}
			}	

	},

//	PC RES
	pc_res : {

	//	usage
		usage : {
			get : {
				all : async(r,c)=>{
						var out = await hub.reports.get.byCategories(hub,['pc_res','usage']);
						c(out);
					}
				},

				query : async(r,p,c)=>{

				//	values			
					let values = await r.index.pc_res.usage.list(r.index,{filters:{years:p.years,months:p.months,locations:p.locations}})
				
				//  columns
					let columns = [];
					for(let i=0;i<p.locations.length;i++){columns.push(await r.index.pc_res.locations.get.byId(r.index,p.locations[i]));}
					
				// 	params 
					let params        = {title: "PC Reservation Usage Statistics"};
					
					params.columns    = columns.map(item=>({label:item.name,key:item.lib_id}));
					
					params.categories = p.years.map(item=>({label:'Year : '+item,key:item}))
					params.items = [];
					params.categories.map(category=>{
						params.items = params.items.concat(p.months.map(item=>({label:r.conf.months[item],parent:category.key,key:category.key+item})));
					});
					params.values	 = values.map(value=>({label:parseInt(value.usage),default:0,column:value.lib_id,parent:value.year+value.month}));				 

					return params;
				},

				build : async(r,p,c)=>{
					let params = await r.pc_res.usage.query(r,p);
					let res = excel._make(excel,params); 
					return c?c(res):res;
				},

				update : async (r,p,c)=>{
					p.ref = r.conf.application.id;
					p.workbook = await r.pc_res.usage.build(r,p.parameters);
					p.categories = ['pc_res','usage'];
					hub.reports.put(hub,p,(p)=>{c(p)});
				},
				insert : async (r,p,c)=>{
					p.ref = r.conf.application.id;
					p.workbook = await r.pc_res.usage.build(r,p.parameters);
					p.categories = ['pc_res','usage'];
					hub.reports.post(hub,p,(p)=>{c(p)});
				
				}
			}	

	},

//	COLLECTIONS
	collections : {

	//	circ
		circ : {
			get : {
				all : async(r,c)=>{
						var out = await hub.reports.get.byCategories(hub,['collections','circ']);
						c(out);
					}
				},

				query : async(r,p,c)=>{

				//	values			
					let values = await r.index.collections.circ.list(r.index,{filters:{years:p.years,months:p.months,types:p.types}})
				
				//  columns
					let columns = [];
					for(let i=0;i<p.types.length;i++){columns.push(await r.index.collections.types.get.byId(r.index,p.types[i]));}
					
				// 	params 
					let params        = {title: "Circulation Statistics"};
					
					params.columns    = columns.map(item=>({label:item.name,key:item.type_id}));
					
					params.categories = p.years.map(item=>({label:'Year : '+item,key:item}))
					params.items = [];
					params.categories.map(category=>{
						params.items = params.items.concat(p.months.map(item=>({label:r.conf.months[item],parent:category.key,key:category.key+item})));
					});
					params.values	 = values.map(value=>({label:parseInt(value.circ),default:0,column:value.type_id,parent:value.year+value.month}));				 

					return params;

				},

				
				build : async(r,p,c)=>{
					console.log("build")
					let params = await r.collections.circ.query(r,p);
					let res = excel._make(excel,params); 
					return c?c(res):res;
				},

				update : async (r,p,c)=>{
					p.ref = r.conf.application.id;
					p.workbook = await r.collections.circ.build(r,p.parameters);
					p.categories = ['collections','circ'];
					hub.reports.put(hub,p,(p)=>{c(p)});
				},
				insert : async (r,p,c)=>{
					console.log(p)
					p.ref = r.conf.application.id;
					p.workbook = await r.collections.circ.build(r,p.parameters);
					p.categories = ['collections','circ'];
					hub.reports.post(hub,p,(p)=>{c(p)});
				 
				}
			}	

	},


//	GENERAL	
	general :{

	//	people
		people : {
			get : {

				all : async(r,c)=>{
						var out = await hub.reports.list(hub,{filters:{app:r.conf.application.id,categories:['general','people']}});
						c(out);
					}
				},

				query : async(r,p)=>{
					
				//	values

					let query   = {search:'',filters:{location:p.locations}}//{years:p.years,months:p.months,locations:p.locations}
	
					query.filters.range = [p.year+"-01-01",p.year+"-12-31"]
					query.filters.item = "619c1058670c2570e7978ed7" // people entering stat id
				
					let values = await r.stats_counter.values.list(r.stats_counter,query)
					
			
				//	locations
					let locations = await r.stats_counter.locations.list(r.stats_counter,{filters:{locations:p.locations}})
					/* values.map((item,i)=>{
						locations.map(location=>{
							if(location._id.toString() === item.location){
								values[i].location = location; 
							}
						})
					}) */

				// 	params 
					let params        = {title: "General People Report"};
				
				//	columns	
					params.columns = [];
					for(let column in r.conf.months){
						params.columns.push({label:r.conf.months[column],key:column})
					}

				//	categories
					params.categories = [];
					params.categories.push({label:p.year,key:p.year})

				//	items	
					params.items  = [];
					params.items  = locations.map(item=>({label:item.name,parent:p.year,key:item._id.toString()}));
				
				//	values
					params.values = [];
					let totals = [];
					for(let i=0;i<values.length;i++){
						if(totals[values[i].location] == undefined){
						totals[values[i].location] = {
							"01":0,
							"02":0,
							"03":0,
							"04":0,
							"05":0,
							"06":0,
							"07":0,
							"08":0,
							"09":0,
							"10":0,
							"11":0,
							"12":0
						};
						}

						totals[values[i].location][values[i].date.toISOString().split("-")[1]] = parseInt(totals[values[i].location][values[i].date.toISOString().split("-")[1]]) + parseInt(values[i].value);

					}			

					params.values = [];
					for (let [location_key, location] of Object.entries(totals)){
						for (let [month_key, month]  of  Object.entries(location)){
							params.values.push({
								label:month,
								default:0,
								column:month_key,
								parent:location_key
							})
						}
					};



					return params;

				},

				

				build : async(r,p,c)=>{
					let params = await r.general.people.query(r,p);
					let res = excel._make(excel,params); 
					return c?c(res):res;
				},

				update : async (r,p,c)=>{
					p.ref = r.conf.application.id;
					p.workbook = await r.general.people.build(r,p.parameters);
					p.categories = ['general','people'];
					hub.reports.put(hub,p,(p)=>{c(p)});
				},  

				insert : async (r,p,c)=>{
					p.ref = r.conf.application.id;
					p.workbook = await r.general.people.build(r,p.parameters);
					p.categories = ['general','people'];
					hub.reports.post(hub,p,(p)=>{c(p)});
				}			
		}	

	}	
	
}