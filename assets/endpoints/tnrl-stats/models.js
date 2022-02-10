const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	
	wifi_locations : function(db){
		var schema = new Schema({
			lib_id: {type:String},
			name: {type:String}
		});
		return db.model('wifi-locations', schema);
	},
	wifi_stats : function(db){
		var schema = new Schema({
			lib_id: {type:String},
			year: {type:String},
			month: {type:String},
			usage: {type:String}
		});
		return db.model('wifi-stats', schema);
	},
	pcres_locations : function(db){
		var schema = new Schema({
			lib_id: {type:String},
			name: {type:String},
			user_link : {type:String}
		});
		return db.model('pcres-locations', schema);
	},
	pcres_stats : function(db){
		var schema = new Schema({
			lib_id: {type:String},
			year: {type:String},
			month: {type:String},
			usage: {type:String}
		});
		return db.model('pcres-stats', schema);
	},
	collection_types : function(db){
		var schema = new Schema({
			type_id: {type:String},
			name: {type:String}
		});
		return db.model('collection-types', schema);
	},
	collection_stats : function(db){
		var schema = new Schema({
			type_id: {type:String},
			year: {type:String},
			month: {type:String},
			circ: {type:String}
		});
		return db.model('collection-stats', schema);
	},
	sierra_circ : function(db){
		var schema = new Schema({
			lib_id: {type:String},
			year: {type:String},
			month: {type:String},
			circ: {type:String}
		});
		return db.model('sierra-circ-stats', schema);
	},
	selfcheck_circ : function(db){
		var schema = new Schema({
			lib_id: {type:String},
			year: {type:String},
			month: {type:String},
			circ: {type:String}
		});
		return db.model('selfcheck-circ-stats', schema);
	},
	circ_locations : function(db){
		var schema = new Schema({
			lib_id: {type:String},
			name: {type:String},
			libcode: {type:String},
			tgroup: {type:String},
			stgroup:{type:String}
		});
		return db.model('circ-locations', schema);
	},
	ml_circ_locations : function(db){
		var schema = new Schema({
			ml_id: {type:String},
			areaname: {type:String},
			stopname: {type:String},
			displayord: {type:String}
		});
		return db.model('ml-circ-locations', schema);
	},
	ml_circ : function(db){
		var schema = new Schema({
			ml_id: {type:String},
			year: {type:String},
			month: {type:String},
			circ: {type:String}
		});
		return db.model('ml-circ-stats', schema);
	}

}