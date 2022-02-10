
const list	   = require('../../utilities/list.js');
const ses      = require('../../utilities/ses.js');
const excel    = require('../../utilities/excel.js');
const alexandria  = require('/var/server/assets/connections/library/alexandria/index.js');
const staffportal = require('/var/server/assets/connections/tnrd/staffportal/index.js');
const sierra   = require('/var/server/assets/connections/library/sierra/index2.js');
const hub      = require('/var/server/assets/endpoints/hub-console/index.js');
const index    = require('./index.js');  // endpoints
const mongoose = require('mongoose');
const fs = require("fs");
const moment  = require("moment");
// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'613a5282f8c0135ddd51f3a4'}},

	init : function(r){

		r.db = mongoose.createConnection('mongodb://localhost/hub-stats-counter',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models.departments  = models.departments(r.db);
		r.models.groups  = models.groups(r.db);
		r.models.locations  = models.locations(r.db);
		r.models.topics = models.topics(r.db);
		r.models.categories = models.categories(r.db);
		r.models.items = models.items(r.db);
		r.models.values = models.values(r.db);
		r.models.settings = models.settings(r.db);
		r.models.lib_stats = models.lib_stats(r.db);

		r.index = index;
		r.index.init(index);

		r.hub = hub;
		r.hub.init(hub);
		r.alexandria = alexandria;
		r.sierra = sierra;
		r.ses = ses.init(ses);

	},

//	

	items : {

		list : async (r,p,c)=>{
			
			var out = await hub.reports.list(hub,{filters:{app:r.conf.application.id}});
			c(out);
		},

		get : {
			all  : async(r,c)=>{ c({})},
			byId : async(r,p,c)=>{
				var out = await hub.reports.get.byId(hub,p);
				c(out);
			}
		},

		query : async(r,p,c)=>{

			// get values
			let _values = await r.index.values.list(r.index,{filters:{location:p.locations,range:[p.from,p.to]}})

			// get locations
			let locations = [],data;
			for(let i=0;i<p.locations.length;i++){locations.push(await r.index.locations.get.byId(r.index,p.locations[i]));}
		
			// map categories & values
			let categories = r.items.map.categories(r,locations);
			let values     = r.items.map.values(r,_values)
			
			return c?c(p):{locations:locations,categories:categories,values:values};
		},

		map : {
			categories : (r,p)=>{
				let cat_list  = [];
				let item_list = [];
				let categories = {};
				for(let i=0;i<p.length;i++){
					let items = p[i].items,item;
					for(let j=0;j<items.length;j++){
						let id = items[j].category._id;
						if(!categories[id]){
							categories[id] = items[j].category;
							categories[id].items = [];
						}
						if(!item_list.includes(items[j]._id.toString())){
							item_list.push(items[j]._id.toString());
							categories[id].items.push(items[j])
						}
					}			
				}
				return categories;
			},
			values : (r,p)=>{
				var values = {};
				for(let i=0;i<p.length;i++){
					let item = p[i];
					let id = item.location.toString();

					if(!values[id]){
						values[id] = {};
					}
					if(!values[id][item.item]){
						values[id][item.item] = 0;
					}
					values[id][item.item] += item.value;
					
				}
				return values;
			},
		},

		build : async(r,p,c)=>{
			
			let data = await r.items.query(r,p);
			let locations  = data.locations;
			let categories = data.categories;
			let values     = data.values;

			let worksheet = {name:"Stats",header:{columns:[]},categories:[]}
			worksheet.header.columns = locations.map(loc=>loc.name);

			for(let i in categories){
				let category = categories[i];
				let worksheet_category = {data:category,items:[]}
				for(let j=0;j<category.items.length;j++){
					let item = category.items[j];
					let worksheet_item = {data:item,values:[]}
					for(let k=0;k<locations.length;k++){
						let ref = values[locations[k]._id.toString()];
						let val = 0;
						if(ref && ref[item._id.toString()]){
							val = parseInt(ref[item._id.toString()]);
						}
						worksheet_item.values.push(val);
					}
					worksheet_category.items.push(worksheet_item);
				}
				worksheet.categories.push(worksheet_category)
			}
			
			let res = excel.make(excel,worksheet);

			//let path = './temp/test.xlsx';
			//await workbook.xlsx.writeFile(path);

			return c?c(res):res;
		},

		update : async (r,p,c)=>{
			p.ref = r.conf.application.id;
			let workbook = await r.items.build(r,p.parameters);
			p.workbook = workbook;
			hub.reports.put(hub,p,(p)=>{c(p)});
		},
		insert : async (r,p,c)=>{
			p.ref = r.conf.application.id;
			p.workbook = await r.items.build(r,p.parameters);
			
			hub.reports.post(hub,p,(p)=>{c(p)});
			
		},
		delete : async (r,p,c)=>{
			r.hub.reports.delete(r.hub,p,(p)=>{
				return c(p);
			});
		}
	},


	
	
}