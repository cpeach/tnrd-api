const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
		var schema = new Schema({

			application: {
				type: String,
				required: true
			},
			name: {
				type: String,
				required: true
			},
			scope: {
				type: JSON
			}, 

		});
		
		return db.model('roles', schema);
		
	}

}
