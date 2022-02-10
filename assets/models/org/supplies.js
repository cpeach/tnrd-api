const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
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
		//schema.index({name:'text','description':'text','brand':'text'});
		//schema.index({'$**': 'text'});
		return db.model('supplies', schema);
		
	}
	
}
