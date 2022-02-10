const express = require('express');
const router  = express.Router();

/*
	ENDPOINTS
*/
const arc = require('./arc.js'); // endpoints

/*
	INVOKE
*/
arc.init(arc);

router.get('/', (req, res) => {res.send('AWS ARCGIS API..')});

// LIBRARY
  // BRANCHES
  router.post('/library/branches',(req,res)=>{arc.get.library.branches(arc,[req.body.params],(p)=>{res.json(p);});});

module.exports = router;