const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	items : function(db){
		var schema = new Schema({
			name  : {type:String}
		});
		return db.model('items', schema);
	},
	global_settings : function(db){
		var schema = new Schema({
			"items"   : {type:Array}
		});
		return db.model('global-settings', schema);
	},
	tnrd_incidents : function(db){
		var schema = new Schema({
			"submited"  : {type:Date,default:Date.now()},
			"date"  : {type:Date},
			"time"  : {type:String},
			"type-general" : {type:Number}, 
			"type-critical" : {type:Array}, 
			"committee" : {type:Number}, 
			"issuer" : {type:String},
			"department" : {type:String},
			"location" : {type:String},   
			"estimate" : {type:String}, 
			"description" : {type:String},
			"parties" : {type:Array},
			"description" : {type:String},
			"corrective-action" : {type:String},
			"action-items" : {type:Array},
			"reported" : {type:String}

		});
		return db.model('tnrd-incidents', schema);
	},
	tnrd_settings : function(db){
		var schema = new Schema({
			"recipients-cupe"  : {type:Array},
			"recipients-bcgeu" : {type:Array},
			"general-types"    : {type:Array},
			"critical-types"   : {type:Array},
			"departments"      : {type:Array},
			"locations"        : {type:Array}
		});
		return db.model('tnrd-settings', schema);
	},
	tnrl_incidents : function(db){
		var schema = new Schema({
			"submited"  : {type:Date,default:Date.now()},
			"date"  : {type:Date},
			"time"  : {type:String},
			"reported-by" : {type:String},
			"branches" : {type:Array},
			"location" : {type:String},
			"patrons" : {type:Array},
			"staff-present" : {type:Array},
			"witnesses" : {type:Array},
			"description" : {type:String},
			"action-list" : {type:Array},
			"action-details" : {type:String},
			"action-followup-items" : {type:Array},
			"additional" : {type:String}
		});
		return db.model('tnrl-incidents', schema);
	},
	tnrl_settings : function(db){
		var schema = new Schema({
			"recipients"    : {type:Array},
			"branches"      : {type:Array},
			"action-list"   : {type:Array}
		});
		return db.model('tnrl-settings', schema);
	}
	
}