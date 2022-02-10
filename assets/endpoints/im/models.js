const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	vendors : function(db){
		
		var schema = new Schema({
			name         	   : {type:String,default:''},
			contact            : {type:String,default:''},
			phone              : {type:String,default:''},
			email              : {type:String,default:''},
			comments           : {type:String,default:''},
		});
		
		return db.model('vendors', schema);
		
	},
	
	supplies : function(db){
		
		var schema = new Schema({
			item_id        		: {type:String},
			name               	: {type:String},
			category_id 		: {type:String},
			description         : {type:String,required:false},
			brand         		: {type:String,required:false},
			unit         		: {type:String,required:false},
			rate         		: {type:Number,required:false,default:0.0},
			stock_on_hand 		: {type:Number,required:false,default:0},
			upc         		: {type:String,required:false},
			image         		: {type:String,defaul:''},
			reorder_level       : {type:Number,required:false,default:10},
			vendor  			: {type:String,required:false},
			cf_link  			: {type:String,required:false},
			active  			: {type:Boolean,required:false,default:true}
			
		});
		
		return db.model('supplies', schema);
		
	},
	
	orders : function(db){
		
		var schema = new Schema({
			order_number        : {type:String},
			contact_id          : {type:String},
			department_id       : {type:String},
			notes               : {type:String},
			state         		: {type:Number,default:0},
			states         		: {type:Array,required:false},
			line_items         	: {type:Array,required:false},
			canceled 			: {type:Boolean,default:false},
			completed 			: {type:Boolean,default:false},
			canceled_date 		: {type:Date,required:false},
			completed_date 		: {type:Date,required:false},
			created_date        : {type:Date,default: Date.now},
		});
		
		return db.model('orders', schema);
		
	},
	
	categories : function(db){ 
		
		var schema = new Schema({
			category_id        : {type:String},
			name               : {type:String},
			parent_category_id : {type:String},
			visibility         : {type:Boolean}
		});
		
		return db.model('categories', schema);
		
	},
	
	cart : function(db){
		
		var schema = new Schema({
			contact : { 
				type: String
			},
			items : {
				type: JSON
			}
		});
		
		
		return db.model('cart', schema);
		
	},

}