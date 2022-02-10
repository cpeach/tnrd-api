const express = require('express');
const router  = express.Router();
const auth   = require('../../utilities/auth.js');


/*
	ENDPOINTS
*/

const index  = require('./index.js');  // endpoints

/*
	INVOKE
*/

index.init(index);
router.get('/', (req, res) => {res.send('TNRL Expiring Patrons..')});


//	EXPIRING

	router.post('/expiring/list',(req,res)=>{index.expiring.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/expiring',(req,res)=>{index.expiring.get.all(index,(p)=>{res.json(p)});});
	router.get('/expiring/summary',(req,res)=>{index.expiring.get.summary(index,(p)=>{res.json(p)});});
	router.get('/expiring/notify',(req,res)=>{index.expiring.notify(index,(p)=>{res.json(p)});});
	router.get('/expiring/:id',(req,res)=>{index.expiring.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/expiring',(req,res)=>{index.expiring.update(index,req.body,(p)=>{res.json(p)});});
	
//	NOTIFIED
	
	router.post('/notified/list',(req,res)=>{index.notified.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/notified',(req,res)=>{index.notified.get.all(index,(p)=>{res.json(p)});});
	router.get('/notified/patrons/:id',(req,res)=>{index.notified.get.patrons(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/notified/:id',(req,res)=>{index.notified.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/notified',(req,res)=>{index.notified.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/notified/:id',(req,res)=>{index.notified.delete(index,req.params.id,(p)=>{res.json(p)});});

//	TEMPLATES

	router.post('/templates/list',(req,res)=>{index.templates.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/templates',(req,res)=>{index.templates.get.all(index,(p)=>{res.json(p)});});
	router.get('/templates/:id',(req,res)=>{index.templates.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/templates',(req,res)=>{index.templates.update(index,req.body,(p)=>{res.json(p)});});

//	SETTINGS

	router.get('/settings',(req,res)=>{index.settings.get.all(index,(p)=>{res.json(p)});});
	router.get('/settings/types',(req,res)=>{index.settings.get.types(index,(p)=>{res.json(p)});});
	router.get('/settings/administrators',(req,res)=>{index.settings.get.administrators(index,(p)=>{res.json(p)});});

	router.put('/settings',(req,res)=>{index.settings.update(index,req.body,(p)=>{res.json(p)});});


//	EXPORT

	module.exports = router;




