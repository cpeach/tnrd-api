const express = require('express');
const router  = express.Router();
const token   = require('../../../utilities/token.js');
/*
	ENDPOINTS
*/

const index  = require('./index.js');  // endpoints

/*
	INVOKE
*/

index.init(index);
router.get('/', (req, res) => {res.send('TNRD APPS API..')});


//	VALIDATE

	router.get('/validate/:barcode/:pin',(req,res)=>{index.validate.get(index,{barcode:req.params.barcode,pin:req.params.pin},(p)=>{res.json(p)});});
	

//	PATRONS

	router.post('/patrons',(req,res)=>{index.patrons.query(index,req.body,(p)=>{res.json(p)});});
	


//	EXPORT

	module.exports = router;




