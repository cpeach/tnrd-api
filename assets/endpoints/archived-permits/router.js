const express = require('express');
const router  = express.Router();
const auth   = require('../../utilities/auth.js');


/*
	ENDPOINTS
*/

const index   = require('./index.js');  // endpoints
/*
	INVOKE
*/

index.init(index);
router.get('/', (req, res) => {res.send('Development Services - Archived Permits..')});


//	RECORDS

	//builsding
	router.post('/records/building/search',(req,res)=>{index.records.building.search.all(index,req.body,(p)=>{res.json(p)});});
	router.post('/records/building/search/count',(req,res)=>{index.records.building.search.count(index,req.body,(p)=>{res.json(p)});});
	router.get('/records/building/:id',(req,res)=>{index.records.building.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	
	//building
	router.post('/records/planning/search',(req,res)=>{index.records.planning.search.all(index,req.body,(p)=>{res.json(p)});});
	router.post('/records/planning/search/count',(req,res)=>{index.records.planning.search.count(index,req.body,(p)=>{res.json(p)});});
	router.get('/records/planning/:id',(req,res)=>{index.records.planning.get.byId(index,req.params.id,(p)=>{res.json(p)});});
		
	
//	EXPORT

	module.exports = router;




