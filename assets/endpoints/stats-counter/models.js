const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	

	departments : function(db){
		var schema = new Schema({ 
			name  : {type:String},
		});
		return db.model('departments', schema); 
	},
	groups : function(db){ 
		var schema = new Schema({ 
			department  : {type:String},  
			name        : {type:String},
			description : {type:String,required:false}
		});
		return db.model('groups', schema);
	},
	locations : function(db){
		var schema = new Schema({
			group  : {type:String},
			name        :  {type:String},
			items       :  {type:Array,default:[]},
			legacy_id   :  {type:Number},
			legacy_code   :  {type:String},
			legacy_bookmobile   :  {type:Number}
		});
		
		return db.model('locations', schema);
	},
	topics : function(db){
		var schema = new Schema({
			group : {type:String},
			name        : {type:String},
			description : {type:String,required:false}
		});
		return db.model('topics', schema);
	},
	categories : function(db){
		var schema = new Schema({
			topic         : {type:String},
			name          : {type:String},
			legacy_id     :  {type:Number},
			legacy_page   :  {type:Number},
			legacy_weight :  {type:Number}
		});
		return db.model('categories', schema);
	},
	items : function(db){
		var schema = new Schema({
			category    : {type:String},
			name        : {type:String},
			description : {type:String,required:false},
			weight      : {type:Number,required:false},
			legacy_id     :  {type:Number},
		});
		return db.model('items', schema);
	},
	values : function(db){
		var schema = new Schema({
			location	   : {type:String},
			item   : {type:String},
			value  : {type:Number},
			date   : {type:Date}
		});
		return db.model('values', schema);
	},	
	settings : function(db){
		var schema = new Schema({
			administrators : {type:Array}
		});
		return db.model('settings', schema);
	},
	lib_stats : function(db){
		var schema = new Schema({
			legancy_id  : {type:Number},
			legacy_lib  : {type:Number},
			legacy_stat : {type:Number}
		});
		return db.model('lib_stats', schema);
	},
	

}