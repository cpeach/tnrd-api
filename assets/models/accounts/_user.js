const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({
			reference: {
				type: String,
				required: true
			},
			profile: {
				type: JSON,
				required: true,
			},
			applications: {
				type: JSON,
				required: true
			},
			username: {
				type: String,
				required: false
			},			
			hidden: {
				type: JSON,
				required: false
			},

		});
		
		return db.model('users', schema);
		
	}

}
