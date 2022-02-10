const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
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
		
	}
	
}
