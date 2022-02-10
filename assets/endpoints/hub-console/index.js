const s3	   = require('../../utilities/s3.js');
const list	   = require('../../utilities/list.js');
const mongoose = require('mongoose');
const excelJS  = require("exceljs");
const fs = require("fs");
const ses  = require('../../utilities/ses.js');

// MODELS

const models = require('./models.js');

module.exports = {
	
	conf : {
		email : {

			content : '<html><body><table style="width:90%;margin:0px auto"  border="0" cellpadding="0" cellspacing="15">_$content<table></body></html>',
			salutation : '<b >Hello,</b><br/><br/>',
			message : '<tr><td style="padding-bottom:15px;">_$message</td></tr>',
			body    : '<tr><td style="background-color:rgb(250,250,250);padding:30px;border:1px solid rgb(220,220,220)">_$body</td></tr>',
			footer  : '<tr><td style="padding-top:15px"><b >TNRD Application Hub</b><br/><a style="color:rgb(117,158,46)" href="https://hub.tnrd.ca">hub.tnrd.ca</a><br/><br/><div style="color:rgb(220,220,220)">---------------------</div><br/><b>Thompson-Nicola Regional District</b><br/>300-465 Victoria St., Kamloops, BC,V2C 2A9</td></tr>'

		}
	},

	init : function(r){

		r.db = mongoose.createConnection('mongodb://localhost/tnrd-hub',{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true});
		
		r.models = {};
		r.models.profiles = models.profiles(r.db);
		r.models.applications = models.applications(r.db);
		r.models.departments  = models.departments(r.db);
		r.models.user    = models.user(r.db);
		r.models.roles   = models.roles(r.db);
		r.models.images  = models.images(r.db);
		r.models.reports = models.reports(r.db);
		r.models.files   = models.files(r.db);
		r.models.resource_links   = models.resource_links(r.db);
		r.models.resource_files   = models.resource_files(r.db);
		r.models.resource_types   = models.resource_types(r.db);
		r.models.notices = models.notices(r.db);
		r.models.notice_items = models.notice_items(r.db);

		r.ses = ses.init(ses);

		r.s3  = s3.init(s3); 
		r.accounts = {
			path:"https://api.tnrdit.ca/accounts"
		};
		
	},

//	USERS
	users :{

		list : async (r,p,c)=>{

			let query={},users;
			var params = {
				search:{
					value:p.search,
					model:r.models.profiles,
					fields:['name','email']					
				}

			};
			let items = await list.query(list,params);
			c(items);
			
		},
		get : {
			
			all  : async function(r,c){
				let users = await r.models.profiles.find();
				c(users);
			},
			byId : async function(r,p,c){
				let user = {}
				user.notices = 0;
				user.profile = await r.models.profiles.findById(p).lean();
				if(user.profile.notices && user.profile.notices.length>0){
					let nr = await r.notices.get.byPatron(r,p);
					let nc = 0; 
					nr.map(item=>{item.status==0?nc++:null})
					user.notices = nc;
				}
				return c?c(user):user; 
			},
			batch : async function(r,p,c){
				let users = await r.models.profiles.find({'_id':p}).lean();
				return c?c(users):users; 
			}
			
		},

		insert : {

			notice : async (r,p)=>{
				
				let _id = p._id;
				delete p._id;
				let _user = await r.models.profiles.findById(_id).lean();
				
				let _notices = _user.notices ? _user.notices : [];
				
				_notices.push(p);
				
				let res = await r.models.profiles.updateOne({"_id":_id.toString()},{"$set":{"notices":_notices}})
				
				return res;
				
			}

		},
		
		update  :{
			all : async function(r,p,c){
				var res = await r.models.profiles.updateOne({"_id":p._id},p)
				c(res)	
			},
			bookmarks : async function(r,p,c){
				var res = await r.models.profiles.updateOne({"_id":p[0]},{"$set":{"bookmarks":p[1]}})
				c(res);	
			},
				
			role : async function(r,p,c){
				
				
				let user = await r.models.profiles.findById(p.user);

				user.applications = user.applications || {}
				user.applications[p.application] = user.applications[p.application] ||{role:'',meta:{}};
				user.applications[p.application].role = p.role;

				var res = await r.models.profiles.updateOne({'_id':p.user},{'$set':{applications:user.applications}}) 
				
				return c?c(res):res;
			}
		
		},

		roles : {

			add : async function(r,p,c){
				let user = await r.models.profiles.findById(p.user).lean();
				let res  = {}; 
				user.roles = user.roles || [];
				user.roles.push(p.role);
				res = await r.models.profiles.updateOne({"_id":p.user},{"$set":{roles:user.roles}}).lean();
				return c?c(res):res;
			},	

			delete : async function(r,p,c){
				let user = await r.models.profiles.findById(p.user).lean();
				let res  = {}; 
				const index = user.roles.indexOf(p.role);
				if (index > -1) {
					user.roles.splice(index, 1); 
					res = await r.models.profiles.updateOne({"_id":p.user},{"$set":{roles:user.roles}}).lean();
				}
				return c?c(res):res;
			}
		}
	},

//	PERMISSIONS

	permissions : {
		list : async (r,p,c)=>{

			var params = {
				search : {
					value:p.search,
					model:r.models.applications,
					fields:['name']
				}
			};
			let user = await r.models.profiles.findById(p.user).lean();
			let res  = await list.query(list,params);
			res    = await r.applications.get.images(r,res);
			res    = await r.applications.get.departments(r,res);

			if(user.applications){
				for(var i=0;i<res.length;i++){
					if(user.applications[res[i]._id]){
						res[i].role = await r.models.roles.findById(user.applications[res[i]._id].role).lean() 
					}else{
						let _default = await r.models.roles.find({name:"Public",application:res[i]._id}).lean();
						res[i].role = _default[0];
					}
				}
			}

			c(res);
		
		},
	},


//	DEPARTMENTS

	departments : {
		export : {},
		list : async (r,p,c)=>{

			var params = {
				search:{
					value:p.search,
					model:r.models.departments,
					fields:['name']					
				}

			};

			let items = await list.query(list,params);
			c(items);
		},
		
		get : {
			
			all  : async function(r,c){
				var res = await r.models.departments.find();
				c(res);
			},
			byId : async function(r,p,c){
				var res = await r.models.departments.findById(p);
				c(res);
			}
			
		},
		insert  : async function(r,p,c){
			var _new = new r.models.departments(p);
			c(await _new.save());			
		},
		update  : async function(r,p,c){
			var res = await r.models.departments.updateOne({_id:p._id},p);
			c(res);			
		},
		delete  : async function(r,p,c){
			var res    = await fetch(r.accounts.path+"/departments/"+p,{method:'DELETE'});
			c(await res.json());
		}
		
	},	
	
//	APPLICATIONS
	applications : {

		list :  async (r,p,c)=>{

			var params = {
				search : {
					value:p.search,
					model:r.models.applications,
					fields:['name','description']					
				},
				filters : []
				
			};

			if(p.filters){
				p.filters.departments ? params.filters.push({reference:'departments',value:p.filters.departments}) : null
			}
			
			let items = await list.query(list,params);
			items     = await r.applications.get.images(r,items);
			items     = await r.applications.get.departments(r,items);
			c(items);

		},
		get : {

			all  : async function(r,c){
				var items = await r.models.applications.find().lean();
				items = await r.applications.get.images(r,items);
				items = await r.applications.get.departments(r,items);
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.applications.findById(p).lean();
				
				res.image_meta = await r.images.get(r,res.image); 
				
				for(var i = 0;i < res.departments.length;i++){
					res.departments[i] = await r.models.departments.findById(res.departments[i]);
				}
				if(c){c(res);}else{return res;}
				
				
			},
			images : async function(r,p){
				for(var i = 0;i < p.length;i++){
					p[i].image_meta = await r.images.get(r,p[i].image); 
				}
				return p
			},
			departments : async function(r,p){
				for(var i = 0;i < p.length;i++){
					for(var j = 0;j < p[i].departments.length;j++){
						p[i].departments[j] = await r.models.departments.findById(p[i].departments[j]);
					}
				}
				return p
			},	

			
		},
		insert  : async function(r,p,c){
			
			var _app = new r.models.applications(p);
			let app  = await _app.save();
			
			// create default roles
			
			let role = new r.models.roles({application:app._id,name:"Public",scope:{}});
			await role.save();
			role = new r.models.roles({application:app._id,name:"Staff",scope:{}});
			await role.save();
			role = new r.models.roles({application:app._id,name:"Admin",scope:{}});
			await role.save();
			role = new r.models.roles({application:app._id,name:"Root",scope:{}});
			await role.save();
			
			c(app);	
		},
		update  : async function(r,p,c){

			var res = await r.models.applications.updateOne({_id:p._id},p);
			c(res);
	
		},
		delete  : async function(r,p,c){
			// **All dependancies need to be considered before implementing this delete method			
		},
		users : {
			get : {
				byRole : async (r,p,c)=>{
					let application = await r.models.applications.find({"short":p.code}).lean();
					let roles = await r.roles.get.byApplication(r,application[0]._id);
					roles.map(item=>{if(item.name === p.role){_role = item._id.toString()}});

					// get 
					let users = await r.models.profiles.find({"roles":[_role]});
					c(users)
				}
			},
			update : {
				byRole : async (r,p,c)=>{
					let application = await r.models.applications.find({"short":p.code}).lean();
					let roles = await r.roles.get.byApplication(r,application[0]._id);
					roles.map(item=>{if(item.name === p.role){_role = item._id.toString()}});

					// get 
					let users = await r.models.profiles.find({"roles":[_role]});
					let _users = users.map(item=>(item._id.toString()));

					!_users||_users.map(async(item)=>{
						if(!p.users.includes(item)){
							console.log("Remove "+item);
							await r.users.roles.delete(r,{user:item,role:_role});
						}
					})
					!p.users||p.users.map(async(item)=>{
						if(!_users.includes(item)){
							console.log("Add "+item)
							await r.users.roles.add(r,{user:item,role:_role});
						}
					})
					c(users)
				}
			},
		},
		documents : {
			add : async(r,p,c)=>{
				// get application by id
				let application = await r.models.applications.findById(p.app).lean();
				let ui = application.ui;
				let docs = application.ui.resources.documents || [];
				docs.push(p.doc);
				ui.resources.documents = docs;
				var res = await r.models.updateOne({_id:p.app},{$set:{ui:ui}});
				c(res)
			}
		}
		
	},

//	ROLES 

	roles : {

		list : async (r,p,c)=>{
			
			var params = {
				search : {
					value : p.search,
					model : r.models.roles,
					fields: ['name'],
					links : [
						{reference:'application',model:r.models.applications,fields:['name']}
					]
				},
			};

			let roles = await list.query(list,params);
			
			for(role in roles){
				roles[role].application = await r.applications.get.byId(r,roles[role].application);
			}
			c(roles);
		},

		get : {
			all : async function(r,c){
				var roles = await r.models.roles.find().lean();
				for(i in roles){
					var app     = await r.models.applications.findById(roles[i].application).lean();
					roles[i].application = app;
				}
				c(roles);
			},
			byId : async function(r,p,c){
				var roles = await r.models.roles.findById(p);
				c(roles);
			},
			byApplication : async function(r,p,c){
				var roles = await r.models.roles.find({application:p}).lean();
				return c?c(roles):roles;
			}
		},

		insert : async function(r,p,c){
			
			/* var params = {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/roles/",params);
			c(await res.json());	 */
			
			//c({})
		}



	},

//	USERS
	_users : {
		export : {},
		query : {
			all : async function(){}
		},
		get : {
			
			all  : async function(r,c){
				
				var users = [];
				var res   = await fetch(r.accounts.path+"/users");
				res       = await res.json();
				res.map(item=>{
					if(item.profile.application._id === '60906b4cf5e24d7d2498642b'){
						users[users.length] = item;
					}
				}) 
				
				c(users); 
			},
			byRef : async function(r,p,c){
				var res  = await fetch(r.accounts.path+"/users/ref/"+p);
				var user = await res.json();
				var img  = await r.models.images.findById(user.profile.image);
				user.profile.image_meta = img;
				
				c(user);
			},
			byProfile : async function(r,p,c){
				var res  = await fetch(r.accounts.path+"/users/profile/"+p);
				var user = await res.json();
				var img  = await r.models.images.findById(user.profile.image);
				user.profile.image_meta = img;
			}
			
		},
		insert  : async function(r,p,c){
			
			var params = {mefdthod:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)}
			var res    = await fetch(r.accounts.path+"/users/",params);
			c(await res.json());	
			
		},
		update  :{
			all : async function(r,p,c){
				var res = await r.models.user.updateOne({"_id":p._id},p)
				c(res)	
			},
			bookmarks : async function(r,p,c){
				var res = await r.models.user.updateOne({"_id":p[0]},{"$set":{"bookmarks":p[1]}})
				c(res);	
			},
		},
		delete  : async function(r,p,c){
			var res    = await fetch(r.accounts.path+"/users/"+p,{method:'DELETE'});
			c(await res.json());			
		},

		role : {
			update : async function(r,p,c){
				var params = {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p[2])}
				var res    = await fetch(r.accounts.path+"/user/role/"+p[0]+"/"+p[1],params);
				var json   = await res.json();
				c(json); 
			},
			blocked : async function(r,p,c){
				
				var params = {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(p[2])}
				var res    = await fetch(r.accounts.path+"/user/blocked/"+p[0]+"/"+p[1],params);
				var json   = await res.json();
				c(json);
			}
		}
		
	},
	 
	
//	IMAGES
	images : {

		list :  async (r,p,c)=>{

			var params = {
				search : {
					value:p.search,
					model:r.models.images,
					fields:['filename']					
				},
				filters : []
				
			};

			/* if(p.filters){
				p.filters.departments ? params.filters.push({reference:'departments',value:p.filters.departments}) : null
			} */
			
			let items = await list.query(list,params);
			/* items     = await r.applications.get.images(r,items);
			items     = await r.applications.get.departments(r,items); */
			c(items);

		},
		get : async function(r,p,c){
			let res = await r.models.images.findById(p);
			if(c){
				c(res);
			}else{
				return res;
			}
		},
		post : async function(r,p,c){
				var params = p;
				var path   = p.path;
				params.application = 'tnrd-hub';
				params.folder      = 'images';
				params.body        = fs.readFileSync(path); 
				
				r.s3.upload(r.s3,params,async function(p){
			
					delete params.body;
					delete params.destination;
					delete params.path;
					params.application = params.ref;
					params.url    = p.Location;
					params.key    = p.key;
					params.bucket = 'tnrd-assets';
					params.tag    = 'image';
					var image = await r.models.images.create(params);
					fs.unlinkSync(path);
					c(image) 
				})
				 
		},
		delete : async function(r,p,c){
			
			var image = await r.models.images.findById(p).lean();
			if(image){
				r.s3.delete(r.s3,image,async function(p){
					var res = await r.models.images.deleteOne({_id:image._id});
					c(res);	
				})
			}else{
				c({})
			}
			//console.log(image)
			
		},

	},
	
	
//	DOCUMENTS
	documents : {

		get : async function(r,p,c){
			c(await r.models.documents.findById(p));
		},
		post : async function(r,p,c){
				var params = p;
				var path   = p.path;
				params.application = 'tnrd-hub';
				params.folder      = 'documents';
				params.body        = fs.readFileSync(path); 
				
				r.s3.upload(r.s3,params,async function(p){
			
					delete params.body;
					delete params.destination;
					delete params.path;
					params.application = params.ref;
					params.url    = p.Location;
					params.key    = p.key;
					params.bucket = 'tnrd-assets';
					params.tags   = params.tags;
					var document = await r.models.documents.create(params);
					fs.unlinkSync(path);
					c(document) 
				})
				 
		},
		delete : async function(r,p,c){
			var document = await r.models.documents.findById(p).lean();

			if(image){
			r.s3.delete(r.s3,image,async function(p){
				var res = await r.models.documents.deleteOne({_id:document._id});
				c(p);	
			})}else{
				c({})
			}
			
		},

	},	

//	FILES
	files : {

		list :  async (r,p,c)=>{

			var params = {
				search : {
					value:p.search,
					model:r.models.files,
					fields:['filename']					
				},
				filters : []
				
			};

			/* if(p.filters){
				p.filters.departments ? params.filters.push({reference:'departments',value:p.filters.departments}) : null
			} */
			
			let items = await list.query(list,params);
			/* items     = await r.applications.get.images(r,items);
			items     = await r.applications.get.departments(r,items); */
			c(items);

		},
		get : async function(r,p,c){
			let res = await r.models.files.findById(p);
			if(c){
				c(res);
			}else{
				return res;
			}
		},
		post : async function(r,p,c){
				var params = p;
				var path   = p.path;
				params.application = 'tnrd-hub';
				params.folder      = 'files';
				params.body        = fs.readFileSync(path); 
				
				r.s3.upload(r.s3,params,async function(p){
			
					delete params.body;
					delete params.destination;
					delete params.path;
					params.application = params.ref;
					params.url    = p.Location;
					params.key    = p.key;
					params.bucket = 'tnrd-assets';
					params.tag    = 'file';
					var image = await r.models.files.create(params);
					fs.unlinkSync(path);
					c(image) 
				})
				 
		},
		delete : async function(r,p,c){
			
			var image = await r.models.files.findById(p).lean();
			if(image){
				r.s3.delete(r.s3,image,async function(p){
					var res = await r.models.files.deleteOne({_id:image._id});
					c(res);	
				})
			}else{
				c({})
			}
			//console.log(image)
			
		},

	},

//	REPORTS	
	reports : {
		
		list :  async (r,p,c)=>{

			let query={};
			var params = {
				search:{
					value:p.search,
					model:r.models.reports,
					fields:['name']		
				},
				filters : [],
				
			};

			if(p.filters){
				p.filters.app ? params.filters.push({reference:'app',value:p.filters.app}) : null;
				p.filters.categories ? params.filters.push({reference:'categories',value:p.filters.categories}) : null
			}
			
			let items = await list.query(list,params);
			items.sort(function(a, b) {
				var textA = a.name.toUpperCase();
				var textB = b.name.toUpperCase();
				return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			});
			
			return c?c(items):items;
		},
		get : {
			all  : async function(r,c){c({})},
			byId : async function(r,p,c){
				let out = await r.models.reports.findById(p)
				return c?c(out):out;
			},
			byCategories : async function(r,p,c){
				let out = await r.models.reports.find({"categories":p})
				return c?c(out):out;
			}
		},
		put : async function(r,p,c){
				
			
				var params = await r.models.reports.findById(p._id).lean();
				
				params.application = 'tnrd-hub';
				params.folder      = 'reports';
				params.workbook    = p.workbook;
				params.parameters  = p.parameters;
				params.name 	   = p.name;
				params.description = p.description;

				let res = await r.s3.delete(r.s3,{bucket:params.bucket,key:params.key})
			
				params.path = '/home/ec2-user/temp/reports/'+params.filename;
				var path = params.path;	
				await params.workbook.xlsx.writeFile(path);
				params.body = fs.readFileSync(path); 

				r.s3.upload(r.s3,params,async function(p){
					delete params.body;
					delete params.destination;
					delete params.path;
					
					params.url    = p.Location;
					params.key    = p.key;
					
					fs.unlinkSync(path);
					var res = await r.models.reports.updateOne({_id:params._id.toString()},params);
					
					c(res) 
				})


		},
		post : async function(r,p,c){
				
				var params = p;
				
				params.application = 'tnrd-hub';
				params.folder      = 'reports';
				
				params.filename = 'report-'+Date.now().toString()+'.xlsx';
				params.path = '/home/ec2-user/temp/reports/'+params.filename;

				var path   = params.path;		

				await params.workbook.xlsx.writeFile(path);
				params.body        = fs.readFileSync(path); 
				
				r.s3.upload(r.s3,params,async function(p){
					
					delete params.body;
					delete params.destination;
					delete params.path;
					params.app = params.ref;
					params.parameters = params.parameters;
					params.url    = p.Location;
					params.key    = p.key;
					params.bucket = 'tnrd-assets';
					params.tag    = 'report';
					
					fs.unlinkSync(path);
		
					var res = await r.models.reports.create(params);
					c(res); 
				})
				 
		},
		delete : async function(r,p,c){
			var report = await r.models.reports.findById(p).lean();
			if(report){
				r.s3.delete(r.s3,report,async function(p){
					var res = await r.models.reports.deleteOne({_id:report._id}).lean();
					res.code = 1;
					c(res);	
				})
			}else{
				let param = {code:0,message:"failed to delete report"}
				c(param);
			}

		}

	},

//	RESOURCE TYPES	
	resource_types : {
		
		get : {
			all : async function(r,c){
				let out = await r.models.resource_types.find();
				return c?c(out):out;
			}
		}
	},

// 	RESOURCE LINKS	
	resource_links : {
		
		get : {
			byApplication  :  async function(r,p,c){
				let out = await r.models.resource_links.find({application:p})
				return c?c(out):out;
			},
			byId : async function(r,p,c){
				let out = await r.models.resource_links.findById(p)
				return c?c(out):out;
			}
		},
		update : async function(r,p,c){
			var res = await r.models.resource_links.updateOne({_id:p._id},p);
			c(res);
		},
		insert : async function(r,p,c){
			var _new = new r.models.resource_links(p);
			c(await _new.save());	
		},
		delete  : async function(r,p,c){
			var res = await r.models.resource_links.deleteOne({_id:p});
			c(res);
		}

	},		
	
// 	RESOURCE FILES	
	resource_files : {
		
		get : {
			byApplication  :  async function(r,p,c){
				let out = await r.models.resource_files.find({application:p}).lean()
				for(var i=0;i<out.length;i++){
					out[i].file_meta = await r.files.get(r,out[i].file); 
				}
				return c?c(out):out;
			},
			byId : async function(r,p,c){
				let out = await r.models.resource_files.findById(p).lean()
				out.file_meta = await r.files.get(r,out.file); 
				return c?c(out):out;
			}
		},
		update : async function(r,p,c){
			var res = await r.models.resource_files.updateOne({_id:p._id},p);
			c(res);
		},
		insert : async function(r,p,c){
			var _new = new r.models.resource_files(p);
			c(await _new.save());	
		},
		delete  : async function(r,p,c){
			var rfile = await r.models.resource_files.findById(p).lean();
			var file  = await r.models.files.findById(rfile.file).lean();
			
			if(file){
				r.s3.delete(r.s3,file,async function(p){
					var res = await r.models.resource_files.deleteOne({_id:rfile._id});
					c(res);	
				})
			}else{
				c({})
			}
			
		}

	},

// 	NOTICES
	notices :  {
		list :  async (r,p,c)=>{
			let res = await r.models.notices.find({});
			c(res);
		},
		send : async function(r,p,c){

			var notice = await r.models.notices.findById(p[0]).lean();
			var params = p[1];

			let users      = await r.users.get.batch(r,p[1].users);
			
			let to 		   = Array.isArray(p[1].to) ? p[1].to : []
			let receivers  = users.map(item=>item.email);
			
			notice.receiver = notice.receiver?notice.receiver.map(item=>item.email):[];
			receivers       = Array.isArray(receivers) ? receivers : []; 

			notice.to = notice.receiver.concat(receivers);
			notice.to = notice.to.concat(to);
		
			notice.body = r.notices.get.email_content(r,[notice,params.replace]);

			notice.subject  = p[1].subject?p[1].subject:notice.subject;
			notice.source   = p[1].sender?p[1].sender+' <noreply@tnrd.ca>':notice.sender+' <noreply@tnrd.ca>';

			// update user notices
			let ni = await r.notice_items.insert(r,{notice:notice._id,params:params.replace,users:p[1].users})
	
			if(p[1].users){
				for(var i=0;i<p[1].users.length;i++){
					let un = await r.users.insert.notice(r,{_id:p[1].users[i],ref:ni._id.toString(),status:0});
				}
			}
			
			let res = notice.to.length>0?await r.ses.send(r.ses,notice):{};
			c?c(res):res; 

		}, 

		get : {

			all  : async function(r,c){
				var items = await r.models.notices.find({});
				c(items); 
			},
			byId : async function(r,p,c){
				var res  = await r.models.notices.findById(p).lean();
				return c?c(res):res;
			},
			byPatron : async function(r,p,c){

				let user     = await r.models.profiles.findById(p).lean();
				
				let _notices = user.notices;
				if(_notices && user.notices.length>0){
					for(let i=0;i<_notices.length;i++){
						let notice_item = await r.notice_items.get.byId(r,_notices[i].ref);
						notice_item.notice  = await r.notices.get.byId(r,notice_item.notice);
						notice_item.content =  r.notices.get.content(r,[notice_item.notice.body,notice_item.params])
						notice_item.status  = _notices[i].status;
						notice_item.title   =  notice_item.notice.name
						_notices[i] = notice_item;
					}
					}
				return c?c(_notices):_notices;
			},
			content :function(r,p){
				let body = p[0];
				let params = p[1];
				for(var i=0;i<params.length;i++){
					body = body.replace(params[i][0],params[i][1]);
				}
				return body;
			},
			email_content : function(r,p){
				
				let notice  = p[0];
				let params  = p[1];
				let content = "";

				body = r.notices.get.content(r,[notice.body,params])
			
				content += r.conf.email.salutation.replace("_$salutation","")
				content += r.conf.email.message.replace("_$message",notice.message)
				content += r.conf.email.body.replace("_$body",body)
				content += r.conf.email.footer.replace("_$footer",notice.footer)
				content = r.conf.email.content.replace("_$content",content)

				return content;
			}

		},
		
		insert  : async function(r,p,c){
			let notices = new r.models.notices(p);
			let res  = await notices.save();
			return c?c(res):res;
					
		},
		update  : async function(r,p,c){

			var res = await r.models.notices.updateOne({_id:p._id},p);
			c(res);
	
		},
		delete  : async function(r,p,c){
						
		}
	},

// 	NOTICE ITEMS
	notice_items :  {
		list :  async (r,p,c)=>{
			let res = await r.models.notice_items.find({});
			c(res);
		},
		
		get : {

			all  : async function(r,c){
				var items = await r.models.notice_items.find({});
				c(items); 
			},
			byId : async function(r,p,c){

				var notice_item  = await r.models.notice_items.findById(p).lean();
				notice_item.notice  = await r.notices.get.byId(r,notice_item.notice);
				notice_item.content =  r.notices.get.content(r,[notice_item.notice.body,notice_item.params])
				notice_item.title   =  notice_item.notice.name
		
				return c?c(notice_item):notice_item;
			},

		},
		
		insert  : async function(r,p,c){
			let notice_item = new r.models.notice_items(p);
			let res  = await notice_item.save();
			return c?c(res):res;
					
		},
		update  : async function(r,p,c){
			var res = await r.models.notice_items.updateOne({_id:p._id},p);
			c(res);
		},
		delete  : async function(r,p,c){
						
		}
	}
		
	
	
}