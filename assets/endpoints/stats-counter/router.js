const express = require('express');
const router  = express.Router();
const auth   = require('../../utilities/auth.js');


/*
	ENDPOINTS
*/

const index   = require('./index.js');  // endpoints
const reports = require('./reports.js');  // reports
/*
	INVOKE
*/

index.init(index);
reports.init(reports);
router.get('/', (req, res) => {res.send('TNRL Stat Counter..')});


//	DEPARTMENTS

	router.post('/departments/list',(req,res)=>{index.departments.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/departments',(req,res)=>{index.departments.get.all(index,(p)=>{res.json(p)});});
	router.get('/departments/:id',(req,res)=>{index.departments.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/departments',(req,res)=>{index.departments.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/departments',(req,res)=>{index.departments.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/departments/:id',(req,res)=>{index.departments.delete(index,req.params.id,(p)=>{res.json(p)});});

//	GROUPS

	router.post('/groups/list',(req,res)=>{index.groups.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/groups',(req,res)=>{index.groups.get.all(index,(p)=>{res.json(p)});});
	router.get('/groups/:id',(req,res)=>{index.groups.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/groups',(req,res)=>{index.groups.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/groups',(req,res)=>{index.groups.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/groups/:id',(req,res)=>{index.groups.delete(index,req.params.id,(p)=>{res.json(p)});});

//	LOCATIONS
	
	router.get('/locations/import',(req,res)=>{index.locations.import(index,(p)=>{res.json(p)});});
	
	router.post('/locations/list',(req,res)=>{index.locations.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/locations/items/:id',(req,res)=>{index.locations.items.get.all(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/locations/:id',(req,res)=>{index.locations.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/locations',(req,res)=>{index.locations.get.all(index,(p)=>{res.json(p)});});
	router.put('/locations',(req,res)=>{index.locations.update(index,req.body,(p)=>{res.json(p)});});
	router.delete('/locations/:id',(req,res)=>{index.locations.delete(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/locations/items',(req,res)=>{index.locations.items.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/locations',(req,res)=>{index.locations.insert(index,req.body,(p)=>{res.json(p)});});

//	TOPICS

	router.post('/topics/list',(req,res)=>{index.topics.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/topics',(req,res)=>{index.topics.get.all(index,(p)=>{res.json(p)});});
	router.get('/topics/:id',(req,res)=>{index.topics.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/topics',(req,res)=>{index.topics.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/topics',(req,res)=>{index.topics.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/topics/:id',(req,res)=>{index.topics.delete(index,req.params.id,(p)=>{res.json(p)});});

//	CATEGORIES

	router.post('/categories/list',(req,res)=>{index.categories.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/categories',(req,res)=>{index.categories.get.all(index,(p)=>{res.json(p)});});
	router.get('/categories/:id',(req,res)=>{index.categories.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/categories',(req,res)=>{index.categories.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/categories',(req,res)=>{index.categories.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/categories/:id',(req,res)=>{index.categories.delete(index,req.params.id,(p)=>{res.json(p)});});

//	ITEMS

	router.post('/items/list',(req,res)=>{index.items.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/items',(req,res)=>{index.items.get.all(index,(p)=>{res.json(p)});});
	router.get('/items/:id',(req,res)=>{index.items.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/items',(req,res)=>{index.items.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/items',(req,res)=>{index.items.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/items/:id',(req,res)=>{index.items.delete(index,req.params.id,(p)=>{res.json(p)});});

//	VALUES

	router.post('/values/list',(req,res)=>{index.values.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/values',(req,res)=>{index.values.get.all(index,(p)=>{res.json(p)});});
	router.get('/values/:id',(req,res)=>{index.values.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/values',(req,res)=>{index.values.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/values',(req,res)=>{index.values.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/values/:id',(req,res)=>{index.values.delete(index,req.params.id,(p)=>{res.json(p)});});

//	SETTINGS

	router.post('/settings/list',(req,res)=>{index.settings.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/settings',(req,res)=>{index.settings.get.all(index,(p)=>{res.json(p)});});
	router.get('/settings/:id',(req,res)=>{index.settings.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/settings',(req,res)=>{index.settings.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/settings',(req,res)=>{index.settings.insert(index,req.body,(p)=>{res.json(p)});});

//	REPORTS
	router.post('/reports/items/list',(req,res)=>{reports.items.list(reports,res.body,(p)=>{res.json(p)});});
	router.get('/reports/items',(req,res)=>{reports.items.get.all(reports,(p)=>{res.json(p)});});
	router.get('/reports/items/:id',(req,res)=>{reports.items.get.byId(reports,req.params.id,(p)=>{res.json(p)});});
	router.put('/reports/items',(req,res)=>{
		reports.items.update(reports,req.body,(p)=>{res.json(p)});
	});
	router.post('/reports/items',(req,res)=>{
		reports.items.insert(reports,req.body,(p)=>{res.json(p)});
	});
	router.delete('/reports/:id',(req,res)=>{reports.items.delete(reports,req.params.id,(p)=>{res.json(p)});});


//	EXPORT

	module.exports = router;




