
const list	   = require('../../utilities/list.js');
const mongoose = require('mongoose');
const fs = require("fs");
const moment = require("moment");

// MODELS

const models = require('./models.js');


module.exports = {
	
	conf : {application:{id:'61faec3868493a1805f8f770'}},

	init : function(r){

		r.db = mongoose.createConnection('mongodb://localhost/hub-tnrl-stats',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models.wifi_locations = models.wifi_locations(r.db);
		r.models.wifi_stats = models.wifi_stats(r.db);
		r.models.pc_res_locations = models.pcres_locations(r.db);
		r.models.pc_res_stats = models.pcres_stats(r.db);
		r.models.collection_types = models.collection_types(r.db);
		r.models.collection_stats = models.collection_stats(r.db);
		r.models.sierra_circs = models.sierra_circ(r.db);
		r.models.selfcheck_circs = models.selfcheck_circ(r.db);
		r.models.circ_locations = models.circ_locations(r.db);
		r.models.ml_circ_locations = models.ml_circ_locations(r.db);
		r.models.ml_circs = models.ml_circ(r.db);


		
	},

//	WIFI	
	wifi : {

	//	locations		
		locations : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.wifi_locations,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.wifi_locations.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.wifi_locations.find({"lib_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.wifi_locations.updateOne({_id:p._id},p);
				c(res);
			},
			insert  : async (r,p,c)=>{
				let items = new r.models.wifi_locations(p);
				let res  = await items.save();
				c(res);
			},
			delete  : async (r,p,c)=>{
				var count = await r.models.wifi_stats.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.wifi_locations.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Lccation cannot be deleted as it has stats related to it."})
				}

			},

		},

	//	usage	
		usage : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.wifi_stats,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				if(p.filters){
					p.filters.years ? params.filters.push({reference:'year',value:p.filters.years}) : null;
					p.filters.months ? params.filters.push({reference:'month',value:p.filters.months}) : null;
					p.filters.locations ? params.filters.push({reference:'lib_id',value:p.filters.locations}) : null;
				}

				let items = await list.query(list,params);
				return c?c(items):items;

			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.wifi_stats.find({});
					c(items); 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.wifi_stats.findById(p).lean();
					return c?c(res):res;
				}
			},
			bulk : {
				insert : async(r,p,c)=>{
					var year = p.year?p.year:null;
					var month = p.month?p.month:null;
					delete p.year;
					delete p.month;

					var insert = [];
					for (lib in p){
						if(p[lib] != ''){

							var usage = {
								year:year,
								month:month,
								lib_id:lib,
								usage:p[lib]
							};
							
							var find = await r.models.wifi_stats.find({year:usage.year,month:usage.month,lib_id:usage.lib_id});

							if(find[0]){
								usage._id = find[0]._id;
								let res = await r.wifi.usage.update(r,usage);
							} else {
								insert[insert.length] = usage;
							}
						}
					}
					var items = await r.models.wifi_stats.insertMany(insert);
					c(items);
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.wifi_stats.updateOne({_id:p._id},p);
				return c?c(res):res;
			},
			insert  : async (r,p,c)=>{
				var find = await r.models.wifi_stats.find({year:p.year,month:p.month,lib_id:p.lib_id});
				if(find[0]){
					p._id = find[0]._id;
					let res = await r.wifi.usage.update(r,p);
					c(res);
				} else {
					let items = new r.models.wifi_stats(p);
					let res  = await items.save();
					c(res);
				}
				
				
			},
			delete  : async (r,p,c)=>{

				var res = await r.models.wifi_stats.deleteOne({_id:p});
				c({code:1,message:res});

			},
		}
	},

//	PC RES	
	pc_res : {

	//	locations	
		locations : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.pc_res_locations,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.pc_res_locations.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.pc_res_locations.find({"lib_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.pc_res_locations.updateOne({_id:p._id},p);
				c(res);
			},
			insert  : async (r,p,c)=>{
				let items = new r.models.pc_res_locations(p);
				let res  = await items.save();
				c(res);
			},
			delete  : async (r,p,c)=>{
				var count = await r.models.pc_res_stats.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.pc_res_locations.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Location cannot be deleted as it has stats related to it."})
				}

			},

		},

	//	usage 	
		usage : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.pc_res_stats,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				if(p.filters){
					p.filters.years ? params.filters.push({reference:'year',value:p.filters.years}) : null;
					p.filters.months ? params.filters.push({reference:'month',value:p.filters.months}) : null;
					p.filters.locations ? params.filters.push({reference:'lib_id',value:p.filters.locations}) : null;
				}

				let items = await list.query(list,params);
				return c?c(items):items;

			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.pc_res_stats.find({});
					c(items); 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.pc_res_stats.findById(p).lean();
					return c?c(res):res;
				}
			},
			bulk : {
				insert : async(r,p,c)=>{
					console.log(p);
					var year = p.year?p.year:null;
					var month = p.month?p.month:null;
					delete p.year;
					delete p.month;

					var insert = [];
					for (lib in p){
						if(p[lib] != ''){

							var usage = {
								year:year,
								month:month,
								lib_id:lib,
								usage:p[lib]
							};
							
							var find = await r.models.pc_res_stats.find({year:usage.year,month:usage.month,lib_id:usage.lib_id});

							if(find[0]){
								usage._id = find[0]._id;
								let res = await r.pc_res.usage.update(r,usage);
							} else {
								insert[insert.length] = usage;
							}
						}
					}
					var items = await r.models.pc_res_stats.insertMany(insert);
					c(items);
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.pc_res_stats.updateOne({_id:p._id},p);
				return c?c(res):res;
			},
			insert  : async (r,p,c)=>{
				/*var find = await r.models.wifi_stats.find({year:p.year,month:p.month,lib_id:p.lib_id});
				if(find[0]){
					p._id = find[0]._id;
					let res = await r.wifi.usage.update(r,p);
					c(res);
				} else {
					let items = new r.models.wifi_stats(p);
					let res  = await items.save();
					c(res);
				}*/
				
				
			},
			delete  : async (r,p,c)=>{

				var res = await r.models.pc_res_stats.deleteOne({_id:p});
				c({code:1,message:res});

			},
		}
	},
	
//	COLLECTIONS
	collections : {

	//	types	
		types : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.collection_types,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.collection_types.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.collection_types.find({"type_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.collection_types.updateOne({_id:p._id},p);
				c(res);
			},
			insert  : async (r,p,c)=>{
				let items = new r.models.collection_types(p);
				let res  = await items.save();
				c(res);
			},
			delete  : async (r,p,c)=>{
				var count = await r.models.collection_stats.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.collection_types.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Location cannot be deleted as it has stats related to it."})
				}

			},

		},

	//	circ 	
		circ : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.collection_stats,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				if(p.filters){
					p.filters.years ? params.filters.push({reference:'year',value:p.filters.years}) : null;
					p.filters.months ? params.filters.push({reference:'month',value:p.filters.months}) : null;
					p.filters.types ? params.filters.push({reference:'type_id',value:p.filters.types}) : null;
				}

				let items = await list.query(list,params);
				return c?c(items):items;

			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.collection_stats.find({});
					c(items); 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.collection_stats.findById(p).lean();
					return c?c(res):res;
				}
			},
			
			update  : async (r,p,c)=>{
				var res = await r.models.collection_stats.updateOne({_id:p._id},p);
				return c?c(res):res;
			},
			bulk :{
				insert : async(r,p,c)=>{
					console.log(p);
					var year = p.year?p.year:null;
					var month = p.month?p.month:null;
					delete p.year;
					delete p.month;

					var insert = [];
					for (type in p){
						if(p[type] != ''){

							var circ = {
								year:year,
								month:month,
								type_id:type,
								circ:p[type]
							};
							
							var find = await r.models.collection_stats.find({year:circ.year,month:circ.month,type_id:circ.type_id});

							if(find[0]){
								circ._id = find[0]._id;
								let res = await r.collections.circ.update(r,circ);
							} else {
								insert[insert.length] = circ;
							}
						}
					}
					var items = await r.models.collection_stats.insertMany(insert);
					c(items);
				},
			},
			
			delete  : async (r,p,c)=>{

				var res = await r.models.collection_stats.deleteOne({_id:p});
				c({code:1,message:res});

			},
		}
	},
	//CIRCULATIOINS
	circs : {
		locations : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.circ_locations,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.circ_locations.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.circ_locations.find({"lib_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.circ_locations.updateOne({_id:p._id},p);
				c(res);
			},
			insert  : async (r,p,c)=>{
				let items = new r.models.circ_locations(p);
				let res  = await items.save();
				c(res);
			},
			delete  : async (r,p,c)=>{
				/*var count = await r.models.wifi_stats.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.wifi_locations.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Location cannot be deleted as it has stats related to it."})
				}*/

			},
		},
		ml_locations : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.ml_circ_locations,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.ml_circ_locations.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.ml_circ_locations.find({"ml_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.ml_circ_locations.updateOne({_id:p._id},p);
				c(res);
			},
			insert  : async (r,p,c)=>{
				let items = new r.models.ml_circ_locations(p);
				let res  = await items.save();
				c(res);
			},
			delete  : async (r,p,c)=>{
				/*var count = await r.models.wifi_stats.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.wifi_locations.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Location cannot be deleted as it has stats related to it."})
				}*/

			},
		},
		selfcheck : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.selfcheck_circs,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.selfcheck_circs.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.selfcheck_circs.find({"lib_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.selfcheck_circs.updateOne({_id:p._id},p);
				return c?c(res):res;
			},
			insert  : async (r,p,c)=>{
				var find = await r.models.selfcheck_circs.find({year:p.year,month:p.month,lib_id:p.lib_id});
				if(find[0]){
					p._id = find[0]._id;
					let res = await r.circs.selfcheck.update(r,p);
					return c?c(res):res;
				} else {
					let items = new r.models.selfcheck_circs(p);
					let res  = await items.save();
					return c?c(res):res;
				}
			},
			delete  : async (r,p,c)=>{
				/*var count = await r.models.collection_stats.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.collection_types.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Location cannot be deleted as it has stats related to it."})
				}*/

			},

		},
		sierra : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.sierra_circs,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.sierra_circs.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.sierra_circs.find({"lib_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.sierra_circs.updateOne({_id:p._id},p);
				return c?c(res):res;
			},
			insert  : async (r,p,c)=>{
				var find = await r.models.sierra_circs.find({year:p.year,month:p.month,lib_id:p.lib_id});
				if(find[0]){
					p._id = find[0]._id;
					let res = await r.circs.sierra.update(r,p);
					return c?c(res):res;
				} else {
					let items = new r.models.sierra_circs(p);
					let res  = await items.save();
					return c?c(res):res;
				}
			},
			delete  : async (r,p,c)=>{
				/*var count = await r.models.sierra_circs.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.collection_types.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Location cannot be deleted as it has stats related to it."})
				}*/

			},

		},
		ml : {
			list :  async (r,p,c)=>{
				let query={};
				var params = {
					search:{
						value:p.search,
						model:r.models.ml_circs,
						fields:['name']			
					},
					filters : [],
					joins : []
				};

				let items = await list.query(list,params);
				return c?c(items):items;
			},
			get  : {
				all  : async (r,c)=>{
					var items = await r.models.ml_circs.find({});
					return c?c(items):items; 
				},
				byId : async (r,p,c)=>{
					var res  = await r.models.ml_circs.find({"lib_id":p}).lean();
					return c?c(res[0]):res[0];
				}
			},
			update  : async (r,p,c)=>{
				var res = await r.models.ml_circs.updateOne({_id:p._id},p);
				return c?c(res):res;
			},
			insert  : async (r,p,c)=>{
				var find = await r.models.ml_circs.find({year:p.year,month:p.month,ml_id:p.ml_id});
				if(find[0]){
					p._id = find[0]._id;
					let res = await r.circs.ml.update(r,p);
					return c?c(res):res;
				} else {
					let items = new r.models.ml_circs(p);
					let res  = await items.save();
					return c?c(res):res;
				}
			},
			delete  : async (r,p,c)=>{
				/*var count = await r.models.sierra_circs.countDocuments({lib_id:p});
				if(count < 1){
					var res = await r.models.collection_types.deleteOne({_id:p});
					c({code:1,message:res});
				} else {
					c({code:0,message:"This Location cannot be deleted as it has stats related to it."})
				}*/

			},

		},
	}
	
	
}