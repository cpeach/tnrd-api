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
router.get('/', (req, res) => {res.send('TNRL HasHad..')});

// HASHAD

	router.get('/hashad/query',(req,res)=>{index.hashad.query(index,req.params.id,(p)=>{res.json(p)});});

//	PATRONS
	router.post('/patrons/list',(req,res)=>{index.patrons.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/patrons',(req,res)=>{index.patrons.get.all(index,(p)=>{res.json(p)});});
	router.get('/patrons/:id',(req,res)=>{index.patrons.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/patrons/history/:id',(req,res)=>{index.checkouts.get.byPatron(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/patrons',(req,res)=>{index.patrons.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/patrons',(req,res)=>{index.patrons.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/patrons/:id',(req,res)=>{index.patrons.delete(index,req.params.id,(p)=>{res.json(p)});});

//  CHECKOUTS
	router.get('/checkouts/:id',(req,res)=>{index.checkouts.get.byPatron(index,req.params.id,(p)=>{res.json(p)});});

//	SUBJECTS
	router.post('/subjects/list',(req,res)=>{index.subjects.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/subjects',(req,res)=>{index.subjects.get.all(index,(p)=>{res.json(p)});});
	router.get('/subjects/:id',(req,res)=>{index.subjects.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/subjects',(req,res)=>{index.subjects.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/subjects',(req,res)=>{index.subjects.insert(index,req.body,(p)=>{res.json(p)});});

//	AUTHORS
	router.post('/authors/list',(req,res)=>{index.authors.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/authors',(req,res)=>{index.authors.get.all(index,(p)=>{res.json(p)});});
	router.get('/authors/:id',(req,res)=>{index.authors.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/authors',(req,res)=>{index.authors.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/authors',(req,res)=>{index.authors.insert(index,req.body,(p)=>{res.json(p)});});

//	FORMATS
	router.post('/formats/list',(req,res)=>{index.formats.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/formats',(req,res)=>{index.formats.get.all(index,(p)=>{res.json(p)});});
	router.get('/formats/:id',(req,res)=>{index.formats.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/formats',(req,res)=>{index.formats.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/formats',(req,res)=>{index.formats.insert(index,req.body,(p)=>{res.json(p)});});

//	SETTINGS
	router.get('/settings',(req,res)=>{index.settings.get.all(index,(p)=>{res.json(p)});});
	router.get('/settings/administrators',(req,res)=>{index.settings.get.administrators(index,(p)=>{res.json(p)});});
	router.put('/settings/',(req,res)=>{index.settings.update(index,req.body,(p)=>{res.json(p)});});
	
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
	


//	EXPORT

	module.exports = router;




