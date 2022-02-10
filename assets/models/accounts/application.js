const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = {
	
	get : function(db){
		
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
			publisher: {
				type: String,
				required: false
			},  
			path: {
				type: String,
				required: false
			},
			link: {
				type: String,
				required: false
			},			
			cognito_id: {
				type: String,
				required: false
			},
			cognito_client: {
				type: String,
				required: false
			},
			ui : {
				type: JSON,
				required: false
			},
			image : {
				type: String,
				required: false
			},
			imageobj : {
				type: JSON,
				required: false
			}  

		});
		
		return db.model('applications', schema);
		
	}

}
