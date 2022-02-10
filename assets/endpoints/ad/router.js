const express = require('express');
const router  = express.Router();
const token   = require('../../utilities/token.js');
const multer  = require('multer');
const path    = require('path');

/*
	ENDPOINTS
*/

const index  = require('./index.js');  // endpoints

/*
	INVOKE
*/

index.init(index);
router.get('/', (req, res) => {res.send('TNRD AD..')});

//  VALIDATE

	router.get('/validate',(req,res)=>{index.validate(index,(p)=>{res.json(p)});});
	

//	EXPORT

	module.exports = router;




