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
router.get('/', (req, res) => {res.send('TNRL Incident Reports..')});


//	SETTINGS

	router.get('/settings/',(req,res)=>{index.settings.get.all(index,(p)=>{res.json(p)});});
	router.get('/settings/administrators',(req,res)=>{index.settings.get.administrators(index,(p)=>{res.json(p)});});
	
	//global
	router.put('/settings/global',(req,res)=>{index.settings.global.update(index,req.body,(p)=>{res.json(p)});});
	router.put('/settings/_global',(req,res)=>{index.settings.global._update(index,req.body,(p)=>{res.json(p)});});
	router.get('/settings/global',(req,res)=>{index.settings.global.get.all(index,(p)=>{res.json(p)});});
	
	//tnrd
	router.get('/settings/tnrd',(req,res)=>{index.settings.tnrd.get.all(index,(p)=>{res.json(p)});});
	router.put('/settings/tnrd',(req,res)=>{index.settings.tnrd.update(index,req.body,(p)=>{res.json(p)});});

	//tnrl
	router.get('/settings/tnrl',(req,res)=>{index.settings.tnrl.get.all(index,(p)=>{res.json(p)});});
	router.put('/settings/tnrl',(req,res)=>{index.settings.tnrl.update(index,req.body,(p)=>{res.json(p)});});

//	INCIDENTS

	//tnrd
	router.post('/incidents/tnrd/list',(req,res)=>{index.incidents.tnrd.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/incidents/tnrd/:id',(req,res)=>{index.incidents.tnrd.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/incidents/tnrd',(req,res)=>{index.incidents.tnrd.get.all(index,(p)=>{res.json(p)});});
	router.post('/incidents/tnrd',(req,res)=>{index.incidents.tnrd.insert(index,req.body,(p)=>{res.json(p)});});
	router.put('/incidents/tnrd',(req,res)=>{index.incidents.tnrd.update(index,req.body,(p)=>{res.json(p)});});
	router.delete('/incidents/tnrd/:id',(req,res)=>{index.incidents.tnrd.delete(index,req.params.id,(p)=>{res.json(p)});});
	
	//tnrl
	router.post('/incidents/tnrl/list',(req,res)=>{index.incidents.tnrl.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/incidents/tnrl',(req,res)=>{index.incidents.tnrl.get.all(index,(p)=>{res.json(p)});});
	router.get('/incidents/tnrl/:id',(req,res)=>{index.incidents.tnrl.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/incidents/tnrl',(req,res)=>{index.incidents.tnrl.insert(index,req.body,(p)=>{res.json(p)});});
	router.put('/incidents/tnrl',(req,res)=>{index.incidents.tnrl.update(index,req.body,(p)=>{res.json(p)});});
	router.delete('/incidents/tnrl/:id',(req,res)=>{index.incidents.tnrl.delete(index,req.params.id,(p)=>{res.json(p)});});
	
//	EXPORT

	module.exports = router;




