//IM

const ses      = require('../../utilities/ses.js');
const s3	   = require('../../utilities/s3.js');
const cognito  = require('../../utilities/cognito.js');
const accounts = require('../accounts/index.js');
const mongoose = require('mongoose');
const https    = require('https');
const http 	   = require('http');
const fs       = require('fs');
const FormData = require('form-data');

// MODELS

const model = require('./models.js');

module.exports = {
	
	data : {

		roles : {},
		mongo:{
			db:process.env.tnrd_im_db,
			options : {useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true}
		},
		cognito : {
			id:process.env.tnrd_im_cognito_id,
			client:process.env.tnrd_im_cognito_client
		},
		
		orders : {
			states : [
						{"name":"Submitted",notes:{}},
						{"name":"Processing",notes:{}},
						{"name":"Partially-filled",notes:{}},
						{"name":"Completed",notes:{}},
						{"name":"Canceled",notes:{}}		    
					]
		},
		
		
		emails : {
			admin : {
				order : 
				'Hello Admin, <br><br>You have received a new order. Please find the details below. Complete details of this order can be found at <a href="https://im.tnrdit.ca">https://im.tnrdit.ca</a><br><br>----------------------------------------------------------------------------------------<br><br> <h2>Sales Order&nbsp;# :&nbsp;@__order_number</h2><br> ----------------------------------------------------------------------------------------<br> <b>&nbsp;Contact &nbsp; : &nbsp;@__contact_name</b><br>----------------------------------------------------------------------------------------<br><br><br>@__items<br><br><b>&nbsp;Total&nbsp;:&nbsp;$@__total</b><br><br><span></span><br><br>Regards,<br><i>TNRD Inventory Management</i><br><br><br>',
				canceled : 
					'Hello, <br><br> @__contact_name has canceled item(s) in thier order. Please find the details below.<br><br>@__notes<br><br>----------------------------------------------------------------------------------------<br><br> <h2>Sales Order&nbsp;# :&nbsp;@__order_number</h2><br> ----------------------------------------------------------------------------------------<br> <b>&nbsp;Contact &nbsp; : &nbsp;@__contact_name</b><br>----------------------------------------------------------------------------------------<br><br><br>@__items<br><br><b>&nbsp;Total&nbsp;:&nbsp;$@__total</b><br><br><span></span><br><br>Regards,<br><i>TNRD Inventory Management</i><br><br><br>',
				low_inventory : 
					'Hello, <br><br>Inventory item(s) have dipped below @__min. Please find the details below.<br><br>----------------------------------------------------------------------------------------<br><br> <h2>@__qty &nbsp; : &nbsp; @__item_name</h2><br> ----------------------------------------------------------------------------------------<br> <br>Regards,<br><i>TNRD Inventory Management</i><br><br><br>',		
			},
			staff : {
				order : 
					'Hello @__contact_name, <br><br>You have placed an order. Please find the details below. Complete details of this order can be found at <a href="https://im.tnrdit.ca">https://im.tnrdit.ca</a><br><br>----------------------------------------------------------------------------------------<br><br> <h2>Sales Order&nbsp;# :&nbsp;@__order_number</h2><br> ----------------------------------------------------------------------------------------<br> <b>&nbsp;Contact &nbsp; : &nbsp;@__contact_name</b><br>----------------------------------------------------------------------------------------<br><br><br>@__items<br><br><b>&nbsp;Total&nbsp;:&nbsp;$@__total</b><br><br><span></span><br><br>Regards,<br><i>TNRD Inventory Management</i><br><br><br>',
				status : 
					'Hello @__contact_name, <br><br>The status of your order has been changed to @__status. Please find the details below.<br><br>@__notes<br><br>----------------------------------------------------------------------------------------<br><br> <h2>Sales Order&nbsp;# :&nbsp;@__order_number</h2><br> ----------------------------------------------------------------------------------------<br> <b>&nbsp;Contact &nbsp; : &nbsp;@__contact_name</b><br>----------------------------------------------------------------------------------------<br><br><br>@__items<br><br><b>&nbsp;Total&nbsp;:&nbsp;$@__total</b><br><br><span></span><br><br>Regards,<br><i>TNRD Inventory Management</i><br><br><br>',	
				canceled : 
					'Hello @__contact_name, <br><br>You have canceled item(s) in your order. Please find the details below.<br><br>@__notes<br><br>----------------------------------------------------------------------------------------<br><br> <h2>Sales Order&nbsp;# :&nbsp;@__order_number</h2><br> ----------------------------------------------------------------------------------------<br> <b>&nbsp;Contact &nbsp; : &nbsp;@__contact_name</b><br>----------------------------------------------------------------------------------------<br><br><br>@__items<br><br><b>&nbsp;Total&nbsp;:&nbsp;$@__total</b><br><br><span></span><br><br>Regards,<br><i>TNRD Inventory Management</i><br><br><br>',
			}
		}
		
	}, 
	
	init : function(r){
		
	
		r.db = mongoose.createConnection('mongodb://localhost/'+r.data.mongo.db, r.data.mongo.options);
		
		r.cognito = cognito;
		
		r.models = {};
		r.models.cart     = model.cart(r.db);
		r.models.category = model.categories(r.db);
		r.models.supply   = model.supplies(r.db);
		r.models.order    = model.orders(r.db);
		r.models.vendor   = model.vendors(r.db);
		r.org = process.env.tnrd_im_org,
		
		r.fs  = fs;
		r.s3  = s3.init(s3); 
		r.ses = ses.init(ses);

		r.accounts = accounts.init();
		
	},

	
	supplies : {

		get :{
			item :async function(r,p,c){
				
				var supply = await r.models.supply.find({item_id:p});
				supply = supply[0]||{code:99,message:'Failed to grab item: '+p}
				c(supply);
			},
			by_category :async function(r,p,c){
				var supply = await r.models.supply.find({category_id:p});
				supply = supply||{code:99,message:'Failed to grab item by category: '+p}
				c(supply);
			}, 
			search :async function(r,p,c){
				var result = await r.models.supply.find(
					{$or:[{ name: { $regex: p.term, $options: "i" }},{ description: { $regex: p.term, $options: "i" }}]}
				);
				c(result)
			},
			image : function(r,p,c){
				c('/var/server/assets/endpoints/org/images/'+p);
			}, 
		},
		insert : {
			
			item :async function(r,p,c){
				var supply = await r.models.supply.create(p);
				c(supply);
			},   
			image : function(r,p,c){
				var params = p;
				params.application = 'tnrd-im';
				params.folder = 'images'
				params.body   = fs.readFileSync(p.path); 
				r.s3.upload(r.s3,p,async function(p){
					var supply   = await r.models.supply.findOne({"_id":params.id});
					supply.image = p.Location||p;
					supply.image_document_id = '';
					supply.image_name = '';
					await supply.save();
					fs.unlinkSync(params.path);
					params.url = supply.image;
					c(params);
				});
				
			}, 
		}, 
		update : {
			item :async function(r,p,c){ 
				var supply = await r.models.supply.updateOne({_id:p._id},p);
				c(supply);
			}
		}, 
		/*delete : {
			item  :async function(r,p,c){
				var supply = await r.models.supply.updateOne({_id:p},{"$set":{"active":false}});
				c(supply)
			},
			images : function(r,p,c){
				var images = p[0];
				var id = p[1];
				var position = p[2]?p[2]:0;
				var image = images[position];
				if(position<images.length){
					var p = ['/api/v1/items/'+id+'/images?organization_id='+r.org+'&document_ids='+image['document_id'],'DELETE'];
					r.zoho.request(r,p,(p)=>{
						images[position] = p;
						r.supplies.delete.images(r,[images,id,(position+1)],c);
					});
				}else{
					c(images);
				}
			},
			inventory : function(r,p,c){
				r.supplies.get.item(r,p,function(p){
					p.initial_stock = "0";
					p.initial_stock_rate = "0";
					r.supplies.update.item(r,p,function(p){c(p)})
					
				})
				
			}
		}*/
	},
	
	categories : {
		
		get : { 
			all : async function(r,c){
				var categories = await r.models.category.find({});
				c(categories);
			},
			/*
			departments : function(r,c){
				var p = ['/api/v1/categories?organization_id='+r.org];
				r.zoho.request(r,p,(p)=>{
					var departments = [];
					for(category in p.categories){
						if(p.categories[category].depth == 0 && p.categories[category].category_id !== "-1"){
							departments[departments.length]=p.categories[category]
						} 
					}
					c(departments);
				});
			} */
		},
		insert : {
			item :async function(r,p,c){
				var category = await r.models.category.create(p);
				c(category);
			}
		},
		
		update : {
			item :async function(r,p,c){
				var category = await r.models.category.updateOne({_id:p._id},p);
				c(category);
			}
		},
		delete :async function(r,p,c){
			var category = await r.models.category.deleteOne({_id:p});
			c(category);				
		}
	},
	
	orders : {
		
		get : {
			item :async function(r,p,c){
				var order = await r.models.order.findOne({order_number:p}).lean();
				if(order){
					order.contact   = await r.accounts.users.get.item(r.accounts,order.contact_id); 
					//order.contact = await r.models.contact.findOne({_id:order.contact_id});
					var line_item = order.line_items; 
					order.total = 0;

					for(li in line_item){
						var item = line_item[li];
						var supply = await r.models.supply.findOne({_id:item[0]});
						order.line_items[li][0] = {item_id:supply._id,name:supply.name,rate:supply.rate,total:(parseFloat(supply.rate).toFixed(2)*parseFloat(item[1]).toFixed(2)) }
						order.total = parseFloat(order.total)+parseFloat(order.line_items[li][0].total); 
						order.total = order.total.toFixed(2);
					}
					c(order); 
				}else{c([])}			
			},
			items : async function(r,p,c){
				var orders = await r.models.order.find({contact_id:p}).sort({created_date:-1}).lean();
				for(o in orders){
					var line_item = orders[o].line_items;
					orders[o].total = 0;
					for(li in line_item){
						var item = line_item[li];
						var supply = await r.models.supply.findOne({_id:item[0]});
						orders[o].line_items[li][0] = {item_id:supply._id,name:supply.name,rate:supply.rate,total:(parseFloat(supply.rate).toFixed(2)*parseFloat(item[1]).toFixed(2)) }
						orders[o].total = parseFloat(orders[o].total)+parseFloat(orders[o].line_items[li][0].total);
						orders[o].total = orders[o].total.toFixed(2)
					}
				}
				
				c(orders);
			},
			
			by_departments :async function(r,p,c){
				
				var orders = await r.models.order.find({}).sort({created_date:-1}).lean();
				
				var d_orders = [];
				for(o in orders){
					if(orders[o].department_id === p){
						var line_item = orders[o].line_items;
						orders[o].contact   = await r.accounts.users.get.item(r.accounts,orders[o].contact_id); 
						orders[o].total = 0;
						for(li in line_item){
							var item = line_item[li];
							var supply = await r.models.supply.findOne({_id:item[0]});
							
							orders[o].line_items[li][0] = {item_id:supply._id,name:supply.name,rate:supply.rate,total:(parseFloat(supply.rate).toFixed(2)*parseFloat(item[1]).toFixed(2)) }
							orders[o].total = parseFloat(orders[o].total)+parseFloat(orders[o].line_items[li][0].total); 
							orders[o].total = orders[o].total.toFixed(2);
						}	
						d_orders.push(orders[o]);
					}

				}
				c(d_orders);

			},
		},
		
		
		insert : {
			item :async function(r,p,c){
				var order = p;
				var id = Math.floor(Math.random() * 10000000000000)
				order.order_number = 'SO-'+id;
				order.states = r.data.orders.states;
				order.states[0].notes.to = order.notes; 
				delete order.notes;
				var cart = await r.models.cart.findOne({"contact":order.contact_id});
				cart.items = {};
				await cart.save();
				order = await r.models.order.create(order);
				for(var item in order.line_items){
					
					var _item = await r.models.supply.findById(order.line_items[item][0]);
					_item.stock_on_hand = _item.stock_on_hand - parseInt(order.line_items[item][1]);
					_item.save();
					
					
					// Send Admin Email
					if(_item.stock_on_hand < _item.reorder_level){	
						var body = r.data.emails.admin.low_inventory;
						body = body.replace('@__min',_item.reorder_level);
						body = body.replace('@__qty',_item.stock_on_hand);
						body = body.replace('@__item_name',_item.name);

						var email = {
							to:['tnrl.supplies@tnrd.ca'], //admins
							subject:'Sales Order '+order.order_number,
							body : body
						}
						r.ses.send(r.ses,email,function(p){console.log(p)});
					}
				}
				r.orders.get.item(r,order.order_number,function(p){
					order = p;
					
					r.request(r,['GET','localhost','8443','/accounts/users/'+process.env.tnrd_im_application],async function(p){
					
						var p = JSON.parse(p);
						var admins = [];
						p.map(item=>{item.role === "Admin"?admins.push(item.profile.email):null;});
						var items = ''
						order.line_items.map(async item=>{
							items += item[1]+'&nbsp;&nbsp;&nbsp;&nbsp;'+item[0].name+"<br>";
						})
						
						// Send Admin Email
						
						var body = r.data.emails.admin.order;
						body = body.replace('@__order_number',order.order_number);
						body = body.replace('@__contact_name',order.contact.profile.first_name +" "+order.contact.profile.last_name);
						body = body.replace('@__items',items);
						body = body.replace('@__total',order.total);

						var email = {
							to:['tnrl.supplies@tnrd.ca','cpeach@tnrd.ca'], //admins
							subject:'Sales Order '+order.order_number,
							body : body
						}
						r.ses.send(r.ses,email,function(e,p){console.log(e);console.log(p)});
						
						// Send staff em ail
						
						var body = r.data.emails.staff.order;
						body = body.replace('@__order_number',order.order_number);
						body = body.replace(/@__contact_name/g,order.contact.profile.first_name +" "+order.contact.profile.last_name);
						body = body.replace('@__items',items);
						body = body.replace('@__total',order.total);

						var email = {
							to:[order.contact.profile.email], //admins
							subject:'Sales Order '+order.order_number,
							body : body
						}
						r.ses.send(r.ses,email,function(p){console.log(p)});						
						
						c(order)
					});
					
					
					
				})
				
				
				
			},
			
			
			
		}, 
		update : {
			status :async function(r,p,c){
				
				switch(p.state){
					case "3" :
						p.completed = true;
						p.completed_date = new Date().toISOString();
						break;
					case "4" : 
						p.canceled = true;
						p.canceled_date = new Date().toISOString();
						break;	
				}
				parseInt(p.state) < 4?p.canceled=false:null
				p.line_items.map(item=>{item[0]=item[0].item_id})
				
				var result    = await r.models.order.updateOne({_id:p._id},p);
				var order     = await r.models.order.findById(p._id).lean(); 
				order.contact = await r.accounts.users.get.item(r.accounts,order.contact_id); 
				
				var items = '';
				order.total  = 0;
				for(item in order.line_items){
					var _item = await r.models.supply.findById(order.line_items[item][0]).lean();
					var ordered = order.line_items[item][2]?"Shipped":"Processing";
					ordered = order.completed?"Shipped":ordered;
					ordered = order.canceled ?"Canceled ":ordered;
					
					items += ordered+'&nbsp;&nbsp;'+order.line_items[item][1]+'&nbsp;&nbsp;'+_item.name+"<br>";
					
					order.total = parseFloat(order.total)+parseFloat(_item.rate*parseInt(order.line_items[item][1])); 
					order.total = order.total.toFixed(2);
				}
				
				
				var body = r.data.emails.staff.status;
				body = body.replace('@__order_number',order.order_number);
				body = body.replace(/@__contact_name/g,order.contact.profile.first_name +" "+order.contact.profile.last_name);
				body = body.replace('@__status',order.states[order.state].name);
				body = body.replace('@__notes',order.states[order.state].notes.from);
				body = body.replace('@__items',items);
				body = body.replace('@__total',order.total);

				var email = {
					to:[order.contact.profile.email], //admins
					subject:'Sales Order '+order.order_number,
					body : body
				}
				r.ses.send(r.ses,email,function(p){});
				
				if(order.canceled == true){
					var body = r.data.emails.admin.canceled;
					body = body.replace('@__order_number',order.order_number);
					body = body.replace(/@__contact_name/g,order.contact.profile.first_name +" "+order.contact.profile.last_name);
					//body = body.replace('@__status',order.states[order.state].name);
					body = body.replace('@__notes',order.states[order.state].notes.to);
					body = body.replace('@__items',items);
					body = body.replace('@__total',order.total);

					var email = {
						to:['tnrl.supplies@tnrd.ca'], //admins
						subject:'Sales Order '+order.order_number,
						body : body
					}
					r.ses.send(r.ses,email,function(p){});
				}
				
				
				c(result);
				
			},
			line_items :async function(r,p,c){
				var order = await r.models.order.updateOne({_id:p._id},{$set:{line_items:p.line_items}});
				c(order);
			},
			cancel : async function(r,p,c){
				
				var count = 0;
				p.line_items.map(item=>{
					item[3]?count++:null;
				})
				
				
				if(count === p.line_items.length){
					// email admin and staff
					p.state = 4;
					p.canceled = true;
					p.canceled_date = new Date().toISOString();
					var result 	  = await r.models.order.updateOne({_id:p._id},p);
					var order     = await r.models.order.findById(p._id).lean(); 
					order.contact = await r.accounts.users.get.item(r.accounts,order.contact_id); 
					
					
					var items = '';
					order.total  = 0;
					for(item in order.line_items){
						var _item = await r.models.supply.findById(order.line_items[item][0]).lean();
						var ordered = order.line_items[item][2]?"Shipped":"Processing";
						ordered = order.completed?"Shipped":ordered;
						ordered = order.canceled?"Canceled ":ordered;
						
						items += ordered+'&nbsp;&nbsp;'+order.line_items[item][1]+'&nbsp;&nbsp;'+_item.name+"<br>";
						order.total = parseFloat(order.total)+parseFloat(_item.rate*parseInt(order.line_items[item][1])); 
						order.total = order.total.toFixed(2);
					}
					
					
					
					// notify user
					var body = r.data.emails.staff.canceled;
					body = body.replace('@__order_number',order.order_number);
					body = body.replace(/@__contact_name/g,order.contact.profile.first_name +" "+order.contact.profile.last_name);
					body = body.replace('@__status',order.states[order.state].name);
					body = body.replace('@__notes','');
					body = body.replace('@__items',items);
					body = body.replace('@__total',order.total);

					var email = {
						to:[order.contact.profile.email], //admins
						subject:'Sales Order '+order.order_number,
						body : body
					}
					r.ses.send(r.ses,email,function(p){});
					// notify admin
					var body = r.data.emails.admin.canceled;
					body = body.replace('@__order_number',order.order_number);
					body = body.replace(/@__contact_name/g,order.contact.profile.first_name +" "+order.contact.profile.last_name);
					//body = body.replace('@__status',order.states[order.state].name);
					body = body.replace('@__notes','');
					body = body.replace('@__items',items);
					body = body.replace('@__total',order.total);

					var email = {
						to:['tnrl.supplies@tnrd.ca'], //admins
						subject:'Sales Order '+order.order_number,
						body : body
					}
					r.ses.send(r.ses,email,function(p){console.log(p)});
					
					
					
					
				}else{
					var result = await r.models.order.updateOne({_id:p._id},{$set:{line_items:p.line_items,canceled:true}});
					
					var order     = await r.models.order.findById(p._id).lean(); 
					order.contact = await r.accounts.users.get.item(r.accounts,order.contact_id); 
					
					
					var items = '';
					order.total  = 0;
					for(item in order.line_items){
						var _item = await r.models.supply.findById(order.line_items[item][0]).lean();
						var ordered = order.line_items[item][2]?"Shipped":"Processing";
						ordered = order.completed?"Shipped":ordered;
						ordered = order.canceled?"Canceled ":ordered;
						
						items += ordered+'&nbsp;&nbsp;'+order.line_items[item][1]+'&nbsp;&nbsp;'+_item.name+"<br>";
						order.total = parseFloat(order.total)+parseFloat(_item.rate*parseInt(order.line_items[item][1])); 
						order.total = order.total.toFixed(2);
					}
					
					
					
					// notify user
					var body = r.data.emails.staff.canceled;
					body = body.replace('@__order_number',order.order_number);
					body = body.replace(/@__contact_name/g,order.contact.profile.first_name +" "+order.contact.profile.last_name);
					body = body.replace('@__status',order.states[order.state].name);
					body = body.replace('@__notes','');
					body = body.replace('@__items',items);
					body = body.replace('@__total',order.total);

					var email = {
						to:[order.contact.profile.email], //admins
						subject:'Sales Order '+order.order_number,
						body : body
					}
					r.ses.send(r.ses,email,function(p){});
					
					// notify admin
					var body = r.data.emails.admin.canceled;
					body = body.replace('@__order_number',order.order_number);
					body = body.replace(/@__contact_name/g,order.contact.profile.first_name +" "+order.contact.profile.last_name);
					//body = body.replace('@__status',order.states[order.state].name);
					body = body.replace('@__notes','');
					body = body.replace('@__items',items);
					body = body.replace('@__total',order.total);

					var email = {
						to:['tnrl.supplies@tnrd.ca'],//admins
						subject:'Sales Order '+order.order_number,
						body : body
					}
					r.ses.send(r.ses,email,function(p){});
					
					
					
					
				}
				
				
				//var order = await r.models.order.updateOne({_id:p._id},{$set:{line_items:p.line_items}});
				c(result)
			}
		}
		
	}, 
	
	cart : { 
		get : {
			item  :async function(r,p,c){
				var result = await r.models.cart.findOne({contact:p});
				c(result);
			},
			items :async function(r,p,c){
				var cart    = await r.models.cart.findOne({contact:p}).lean();
				//var items   = cart.items;
				var items = Object.keys(cart.items).map(key=>(key))
				var supplies   = await r.models.supply.find({_id: {$in : items}});
				c(supplies);
			},
		},
		update : {
			clear : async function(r,p,c){
				var cart = await r.models.cart.updateOne({reference:p},{items:{}});
				c(cart);
			}, 
			item : async function(r,p,c){
				var cart = await r.models.cart.findOne({contact:p.contact}).lean();
				if(!cart){
					cart = await r.models.cart.create(p);
				}else{
					await r.models.cart.updateOne({contact:p.contact},{$set:{items:p.items}});
				}
				
				c(cart);
			}
		}
	},
	vendors : {
		
		
		get : { 
			all : async function(r,c){
				var vendors = await r.models.vendor.find({});
				c(vendors);
			},
			item : async function(r,c){
				var vendor = await r.models.vendor.findOne({_id:p});
				c(vendor);				
			} 
		},
		insert : {
			item :async function(r,p,c){
				var vendor = await r.models.vendor.create(p);
				vendor.code = 1;
				c(vendor);
			}
		},
		
		update : {
			item :async function(r,p,c){
				var vendor = await r.models.vendor.updateOne({_id:p._id},p);
				c(vendor);
			}
		},
		delete :async function(r,p,c){
			var vendor = await r.models.vendor.deleteOne({_id:p});
			c(vendor);				
		}
	},	
	
	
//	REQUEST
	request : function(r,p,c){
		var data = typeof p[4] === 'object' ? JSON.stringify(p[4]):p[4];
		var req = http.request({method:p[0],host:p[1],port:p[2],path:p[3]}, function(p){
			var str = '';
			p.on('data',function(chunk){str+=chunk;});
			p.on('end',function(){c(str);});
		});
		req.setHeader('Content-Type', 'application/json');
		p[0]!=='GET'&& p[0]!=='DELETE'?req.write(data):null;
		req.end();
	}
	

	
}