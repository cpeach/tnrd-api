const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	profiles : function(db){
		
		var schema = new Schema({
			uid           : {type:String,required:true},
			uid           : {type:String,required:true},			
			name          : {type:String,required:false},
			email         : {type:String,required:false},
			applications  : {type:JSON,default:{},required:true},
			roles         : {type:Array,default:[]},
			image         : {type:String,required:false},
			notices       : {type:Array,required:false},
			bookmarks     : {type:Array,required:false},
			active        : {type:Boolean,default:true},
			created       : {type:Date,default:Date.now}	
		});
	
		return db.model('profiles', schema);
		
	},
	applications : function(db){
		var schema = new Schema({

				departments: {
					type: Array,
					required: true,
					trim: true
				},
				name: {
					type: String,
					required: true
				},
				short: {
					type: String,
					required: true
				},
				description: {
					type: String,
					required: false
				}, 
				hosted: {
					type: Boolean,
					required: false
				}, 
				
				ui : {
					type: JSON,
					required: false
				},
				image : {
					type: String,
					required: false
				}

		});
		return db.model('applications', schema);
	},
	departments : function(db){
		var schema = new Schema({

			name: {
				type: String,
				required: true,
				trim: true
			},
			short: {
				type: String,
				required: true
			},
			description: {
				type: String
			}

		});
		return db.model('departments', schema);
	},	
	user : function(db){
		
		var schema = new Schema({
			first_name      : {type:String},
			last_name       : {type:String},
			email           : {type:String},
			image           : {type:String,required:false},
			notices         : {type:Array,required:false},
			bookmarks       : {type:Array,required:false},
			active          : {type:Boolean,default:true},
			created         : {type:Date,default:Date.now}	
		});
	
		return db.model('users', schema);
		
	},
	roles : function(db){
		
		var schema = new Schema({
			application:{type:String,required:true},
			name:{type:String,required:true},
			scope:{type:JSON,required:true}
		});
	
		return db.model('roles', schema);
		
	},
	images : function(db){
		
		var schema = new Schema({
			tags         : {type:Array,default:[]},
			originalname : {type:String},
			encoding     : {type:String},
			mimetype     : {type:String},
			url          : {type:String},
			bucket       : {type:String},
			key          : {type:String,required:false},
			filename     : {type:String},
			size         : {type:Number},
			application  : {type:String},
			app          : {type:String,required:false},
			created      : {type:Date,default:Date.now}	
		});
		
		return db.model('images', schema);
		
	},
	documents : function(db){
		
		var schema = new Schema({
			name         : {type:String},
			description  : {type:String},
			url          : {type:String},
			folder       : {type:String},
			bucket       : {type:String},
			key          : {type:String,required:false},
			filename     : {type:String},
			size         : {type:Number},
			application  : {type:String},
			app          : {type:String},
			tags     	 : {type:Array,required:false},
			created      : {type:Date,default:Date.now}	
		});
		
		return db.model('documents', schema);
		
	},
	files : function(db){
		
		var schema = new Schema({
			tags         : {type:Array,default:[]},
			originalname : {type:String},
			encoding     : {type:String},
			mimetype     : {type:String},
			url          : {type:String},
			bucket       : {type:String},
			key          : {type:String,required:false},
			filename     : {type:String},
			size         : {type:Number},
			application  : {type:String},
			app          : {type:String,required:false},
			created      : {type:Date,default:Date.now}	
		});
		
		return db.model('files', schema);
	},
	reports : function(db){
		
		var schema = new Schema({
			name         : {type:String},
			description  : {type:String},
			url          : {type:String},
			folder       : {type:String},
			bucket       : {type:String},
			key          : {type:String,required:false},
			filename     : {type:String},
			size         : {type:Number},
			application  : {type:String},
			app          : {type:String},
			categories   : {type:Array},
			parameters	 : {type:JSON},
			created      : {type:Date,default:Date.now}	
		});
		
		return db.model('reports', schema);
		
	},
	resource_links : function(db){
		
		var schema = new Schema({
			name         : {type:String},
			description  : {type:String},
			url          : {type:String},
			application  : {type:String},
			type		 : {type:String}	
		});
		
		return db.model('resource_links', schema);
		
	},
	resource_files : function(db){
		
		var schema = new Schema({
			name         : {type:String},
			description  : {type:String},
			file         : {type:String},
			application  : {type:String},
			type		 : {type:String}	
		});
		
		return db.model('resource_files', schema);
		
	},
	resource_types : function(db){
		
		var schema = new Schema({
			name : {type:String}
		});
		
		return db.model('resource_types', schema);
		
	},
	notices :  function(db){
		
		var schema = new Schema({
			
			application : {type:String},
			name        : {type:String},
			filters     : {type:Array},
			subject     : {type:String},
			sender      : {type:String},
			receiver    : {type:Array},
			message     : {type:String},
			body        : {type:String}

		});
	
		return db.model('notices', schema);
	},
	notice_items :  function(db){
		
		var schema = new Schema({
			notice 		: {type:String},
			params      : {type:Array},
			date        : {type:Date,default:Date.now},
			users		: {type:Array}	
		});
	
		return db.model('notice_items', schema);
	}
}