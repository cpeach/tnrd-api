const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
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
			},
			
		});
		
		return db.model('departments', schema);
		
	}

}
