
const list	   = require('../../utilities/list.js');
const ses      = require('../../utilities/ses.js');
const alexandria = require('/var/server/assets/connections/library/alexandria/index.js');
const staffportal = require('/var/server/assets/connections/tnrd/staffportal/index.js');
const sierra   = require('/var/server/assets/connections/library/sierra/index2.js');
const hub      = require('/var/server/assets/endpoints/hub-console/index.js');
const mongoose = require('mongoose');
const fs = require("fs");
const moment = require("moment");

// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'613a5282f8c0135ddd51f3a4'}},

	init : function(r){

		r.db = mongoose.createConnection(process.env.mongo'+hub-stats-counter',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
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
		//r.models.items = models.items(r.db);

		r.hub = hub;
		r.hub.init(hub);
		r.alexandria = alexandria;
		//r.staffportal = staffportal;
		//r.staffportal.init(r.staffportal);
		r.sierra = sierra;
		r.ses = ses.init(ses);

		
		//r.staffportal.query(r.staffportal,['SELECT NOW()'],function(p){console.log(p)})

	},

//	DEPARTMENTS

	departments : {

		list :  async (r,p,c)=>{

			var params = {
               search : {
                   value:p.search,
                   model:r.models.departments,
                   fields:['name']                 
               }
           };
 
           let items = await list.query(list,params);
		   
		   for(var i=0;i<items.length;i++){
			   items[i].groups = await r.groups.list(r,{filters:{department:items[i]._id.toString()}});
		   }
		 
		   c(items); 	
		},
		get  : {
			all  : async function(r,c){
				var items = await r.models.departments.find({});
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.departments.findById(p).lean();
				c(res);
			},
		},
		update  : async (r,p,c)=>{
			var res = await r.models.departments.updateOne({_id:p._id},p);
			c(res);
			},
		insert  : async (r,p,c)=>{

			let departments = new r.models.departments(p);
			let res  = await departments.save();
			c(res);
		},
		delete  : async (r,p,c)=>{
			var count = await r.models.groups.countDocuments({department:p});
			if(count < 1){
				var res = await r.models.departments.deleteOne({_id:p});
				c({code:1,message:res});
			} else {
				c({code:0,message:"This department cannot be deleted because it contains active groups."})
			}
		},
	},

//	GROUPS

	groups : {

		list :  async (r,p,c)=>{

			let query={};
			var params = {
				search:{
					value:p.search,
					model:r.models.groups,
					fields:['name']
				},
				filters : [],
				joins : [
					{reference:'department',model:r.models.departments},
					{reference:'locations',model:r.models.locations,field:'group'}
				]
			};

			if(p.filters){
				p.filters.department ? params.filters.push({reference:'department',value:p.filters.department}) : null
			}

			let items = await list.query(list,params);

			return c?c(items):items;
		},
		get  : {
			all  : async function(r,c){
				var items = await r.models.groups.find({});
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.groups.findById(p).lean();
				c(res);
			},
		},
		update  : async (r,p,c)=>{
			var res = await r.models.groups.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let groups = new r.models.groups(p);
			let res  = await groups.save();
			c(res);

		},
		delete  : async (r,p,c)=>{
			var count = await r.models.locations.countDocuments({group:p});
			if(count < 1){
				var res = await r.models.groups.deleteOne({_id:p});
				c({code:1,message:res});
			} else {
				c({code:0,message:"This group cannot be deleted because it contains active Locations."})
			}
		},
	},

//	LOCATIONS

	locations : {

/* 		import : async (r,c)=>{

			let _locations = await r.models.locations.find();
			let _items     = await r.models.items.find();
			let _lib_stats = await r.models.lib_stats.find();

			let _location_items = {},item_id;

			var get_item = (p)=>{
				let res;
				_items.map(item=>{
					res = item.legacy_id===p?item._id:res
				})
				return res;
			}

			_locations.map((loc,i)=>{
				//console.log(loc)
				
				_location_items[loc._id] = []
				_lib_stats.map(libstat=>{
					if(libstat.legacy_lib === loc.legacy_id){
						item_id = get_item(libstat.legacy_stat)

						!_location_items[loc._id].includes(item_id)?_location_items[loc._id].push(item_id):null
					}
					
				})

			})
			//_location_items
			
			for(let i in _location_items){
				console.log(i)
				//let _res = await r.models.locations.updateOne({_id:i},{$set:{items:_location_items[i]}})
				console.log(_res)
			}
			
			c(_location_items)
		}, */

		list :  async (r,p,c)=>{

			let query={};
			var params = {
				search:{
					value:p.search,
					model:r.models.locations,
					fields:['name']		
				},
				filters : [],
				joins : [
					{reference:'group',model:r.models.groups},
				]
			};

			if(p.filters){
				p.filters.group ? params.filters.push({reference:'group',value:p.filters.group}) : null
				p.filters.locations ? params.filters.push({reference:'_id',value:p.filters.locations}) : null
			}
			
			let items = await list.query(list,params);
		
			items.sort(function(a, b) {
				var textA = a.name.toUpperCase();
				var textB = b.name.toUpperCase();
				return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			});
			
			for(let i = 0; i<items.length;i++){
				items[i].items = await r.locations.items.get.all(r,items[i]._id);
				items[i].category = await r.models.categories.findById(items[i].category).lean();
			}
			return c?c(items):items;
		},
		items :{
			get : {
				all : async function(r,p,c){
					
					var location = await r.models.locations.findById(p).lean();
					var items = location.items; 

					for(let i = 0; i<items.length;i++){
						items[i] = await r.models.items.findById(items[i]).lean();
						items[i].category = await r.models.categories.findById(items[i].category).lean();
					}

					return c?c(items):items;
				
				}
			},
			update : async (r,p,c)=>{
				var res = await r.models.locations.updateOne({_id:p._id},{$set:{items:p.items}})
				c(res);
			}
		},
		get  : {
			
			all  : async function(r,c){
				var items = await r.models.locations.find({}).lean();
				for(let i=0;i<items.length;i++){
					items[i].group = await r.models.groups.findById(items[i].group).lean();
				}
				c(items); 
			},
			byId : async function(r,p,c){
				var item  = await r.models.locations.findById(p).lean();
				
				item.items    = await r.locations.items.get.all(r,item._id);
				item.category = await r.models.categories.findById(item.category).lean();
			
				return c?c(item):item;
			},
		},
		update  : async (r,p,c)=>{
			var res = await r.models.locations.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let locations = new r.models.locations(p);
			let res  = await locations.save();
			c(res);

		},
		delete  : async (r,p,c)=>{
			var res = await r.models.locations.deleteOne({_id:p});
			c({code:1,message:res});
		},
	},

//	TOPICS

	topics : {

		list :  async (r,p,c)=>{
			let query={};
			var params = {
				search:{
					value:p.search,
					model:r.models.topics,
					fields:['name']			
				},
				filters : [],
				joins : [
					{reference:'categories',model:r.models.categories,field:'topic'}
				]
			};

			if(p.filters){
				p.filters.group ? params.filters.push({reference:'group',value:p.filters.group}) : null
			}
			let items = await list.query(list,params);
			return c?c(items):items;
		},
		get  : {
			all  : async (r,c)=>{
				var items = await r.models.topics.find({});
				c(items); 
			},
			byId : async (r,p,c)=>{
				var res  = await r.models.topics.findById(p).lean();
				c(res);
			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.topics.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let topics = new r.models.topics(p);
			let res  = await topics.save();
			c(res);

		},
		delete  : async (r,p,c)=>{
			var count = await r.models.categories.countDocuments({topic:p});
			if(count < 1){
				var res = await r.models.topics.deleteOne({_id:p});
				c({code:1,message:res});
			} else {
				c({code:0,message:"This topic cannot be deleted because it contains active categories."})
			}
		},
	},

//	CATEGORIES

	categories : {

		list :  async (r,p,c)=>{
			let query={};
			var params = {
				search:{
					value:p.search,
					model:r.models.categories,
					fields:['name']			
				},
				filters : [],
				joins : [
					{reference:'topic',model:r.models.topics},
					{reference:'items',model:r.models.items,field:'category'}
					
				]
				
			};

			if(p.filters){
				p.filters.topic ? params.filters.push({reference:'topic',value:p.filters.topic}) : null
			}
			
			let items = await list.query(list,params);
			return c?c(items):items;
		},
		get  : {
			all  : async (r,c)=>{
				var items = await r.models.categories.find({});
				c(items); 
			},
			byId : async (r,p,c)=>{
				var res  = await r.models.categories.findById(p).lean();
				c(res);
			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.categories.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let categories = new r.models.categories(p);
			let res  = await categories.save();
			c(res);

		},
		delete  : async (r,p,c)=>{
			var count = await r.models.items.countDocuments({category:p});
			if(count < 1){
				var res = await r.models.categories.deleteOne({_id:p});
				c({code:1,message:res});
			} else {
				c({code:0,message:"This category cannot be deleted because it has items within it."})
			}
		},
	},

//	ITEMS

	items : {

		list :  async (r,p,c)=>{
			let query={};
			var params = {
				search:{
					value:p.search,
					model:r.models.items,
					fields:['name']			
				},
				filters : [],
				joins : [
					{reference:'category',model:r.models.categories},
				]
				
			};

			if(p.filters){
				p.filters.category ? params.filters.push({reference:'category',value:p.filters.category}) : null
			}
			
			let items = await list.query(list,params);
			return c?c(items):items;
		},
		get  : {
			all  : async (r,c)=>{
				var items = await r.models.items.find({});
				c(items); 
			},
			byId : async (r,p,c)=>{
				var res  = await r.models.items.findById(p).lean();
				c(res);
			}
		},
		update  : async (r,p,c)=>{
			var res = await r.models.items.updateOne({_id:p._id},p);
			c(res);
		},
		insert  : async (r,p,c)=>{
			let items = new r.models.items(p);
			let res  = await items.save();
			c(res);

		},
		delete  : async (r,p,c)=>{
			
			var count = await r.models.locations.countDocuments({items:p});
			if(count < 1){
				var res = await r.models.items.deleteOne({_id:p});
				c({code:1,message:res});
			} else {
				c({code:0,message:"This item cannot be deleted as it is used in some locations "})
			}
		},
	},

//	VALUES

	values : {

		list :  async (r,p,c)=>{
			let query={};
			var params = {
				search:{
					value:p.search,
					model:r.models.values,
					fields:['_id']			
				},
				filters : [],
				joins : []
				
			};
			
			if(p.filters){
				p.filters.date     ? params.filters.push({reference:'date',value:new Date(p.filters.date)}) : null;
				p.filters.dates    ? params.filters.push({reference:'date',value:p.filters.dates}) : null;
				p.filters.range    ? params.filters.push({reference:'date',value:[new Date(p.filters.range[0]),new Date(p.filters.range[1])]}) : null;
				p.filters.location ? params.filters.push({reference:'location',value:p.filters.location}) : null;
				p.filters.item ? params.filters.push({reference:'item',value:p.filters.item}) : null;
			}
			
			let items = await list.query(list,params);
			return c?c(items):items;
		},
		get  : {
			all  : async (r,c)=>{
				var items = await r.models.values.find({});
				c(items); 
			},
			byId : async (r,p,c)=>{
				var res  = await r.models.values.findById(p).lean();
				return c?c(items):items;
			}
		},
		update  : async (r,p,c)=>{
 			let res;
			let val = await r.models.values.find({location:p.location,date:{'$gte':moment(p.date).toDate(),'$lt':moment(p.date).add(1,'days').toDate()},item:p.item})
			val = val[0];
			
			console.log(val)

			if(val){
				res = await r.models.values.updateOne({_id:val.id},{$set:{value:parseInt(p.value)}});
			} else {
				res = await r.values.insert(r,p)
			}
			c(res)
		},
		insert  : async (r,p,c)=>{
			let item = new r.models.values(p);
			let res   = await item.save();
			return c?c(res):res;
		},
		delete  : async (r,p,c)=>{
			var res = await r.models.values.deleteOne({_id:p});
			c({code:1,message:res});
		},
	},

//	SETTINGS

	settings : {

		list :  async (r,p,c)=>{},
		get  : {
			all  : async (r,c)=>{},
			byId : async (r,p,c)=>{}
		},
		update  : async (r,p,c)=>{},
		insert  : async (r,p,c)=>{},
		delete  : async (r,p,c)=>{},
	}	

	
	
}