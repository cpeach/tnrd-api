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
router.get('/', (req, res) => {res.send('TNRL - Stats Dashboard..')});


//	WIFI

	// 	locations
		router.get('/wifi/locations',(req,res)=>{index.wifi.locations.get.all(index,(p)=>{res.json(p)});});

	// 	usage
		router.get('/wifi/usage',(req,res)=>{index.wifi.usage.list(index,(p)=>{res.json(p)});});
		router.post('/wifi/usage',(req,res)=>{index.wifi.usage.insert(index,req.body,(p)=>{res.json(p)});});
		router.post('/wifi/usage/bulk',(req,res)=>{index.wifi.usage.bulk.insert(index,req.body,(p)=>{res.json(p)});});

	// 	reports
		router.get('/reports/wifi/usage',(req,res)=>{reports.wifi.usage.get.all(reports,(p)=>{res.json(p)});});
		router.put('/reports/wifi/usage',(req,res)=>{reports.wifi.usage.update(reports,req.body,(p)=>{res.json(p)});});
		router.post('/reports/wifi/usage',(req,res)=>{reports.wifi.usage.insert(reports,req.body,(p)=>{res.json(p)});});
		
//PC RES

	// 	locations
		router.get('/pc_res/locations',(req,res)=>{index.pc_res.locations.get.all(index,(p)=>{res.json(p)});});

	// 	usage
		router.get('/pc_res/usage',(req,res)=>{index.pc_res.usage.list(index,(p)=>{res.json(p)});});
		router.post('/pc_res/usage',(req,res)=>{index.pc_res.usage.bulk.insert(index,req.body,(p)=>{res.json(p)});});
	
	// 	reports
		router.get('/reports/pc_res/usage',(req,res)=>{reports.pc_res.usage.get.all(reports,(p)=>{res.json(p)});});
		router.put('/reports/pc_res/usage',(req,res)=>{reports.pc_res.usage.update(reports,req.body,(p)=>{res.json(p)});});
		router.post('/reports/pc_res/usage',(req,res)=>{reports.pc_res.usage.insert(reports,req.body,(p)=>{res.json(p)});});

//COLLECTIONS

	// 	types
		router.get('/collections/types',(req,res)=>{index.collections.types.get.all(index,(p)=>{res.json(p)});});

	// 	usage
		router.get('/collections/circ',(req,res)=>{index.collections.circ.list(index,(p)=>{res.json(p)});});
		router.post('/collections/circ',(req,res)=>{index.collections.circ.bulk.insert(index,req.body,(p)=>{res.json(p)});});
	
	// 	reports
		router.get('/reports/collections/circ',(req,res)=>{reports.collections.circ.get.all(reports,(p)=>{res.json(p)});});
		router.put('/reports/collections/circ',(req,res)=>{reports.collections.circ.update(reports,req.body,(p)=>{res.json(p)});});
		router.post('/reports/collections/circ',(req,res)=>{reports.collections.circ.insert(reports,req.body,(p)=>{res.json(p)});});
		
//	CIRCULATIONS

	//  locations 
		router.get('/circs/locations',(req,res)=>{index.circs.locations.get.all(index,(p)=>{res.json(p)});});
		router.get('/circs/ml/locations',(req,res)=>{index.circs.ml_locations.get.all(index,(p)=>{res.json(p)});});

	//	selfcheck
		router.get('/circs/selfcheck',(req,res)=>{index.circs.selfcheck.list(index,(p)=>{res.json(p)});});
		router.post('/circs/selfcheck',(req,res)=>{index.circs.selfcheck.insert(index,req.body,(p)=>{res.json(p)});});
		router.put('/circs/selfcheck',(req,res)=>{index.circs.selfcheck.update(index,req.body,(p)=>{res.json(p)});});

	//	sierra
		router.get('/circs/sierra',(req,res)=>{index.circs.sierra.list(index,(p)=>{res.json(p)});});
		router.post('/circs/sierra',(req,res)=>{index.circs.sierra.insert(index,req.body,(p)=>{res.json(p)});});
		router.put('/circs/sierra',(req,res)=>{index.circs.sierra.update(index,req.body,(p)=>{res.json(p)});});

	//	ml
		router.get('/circs/ml',(req,res)=>{index.circs.ml.list(index,(p)=>{res.json(p)});});
		router.post('/circs/ml',(req,res)=>{index.circs.ml.insert(index,req.body,(p)=>{res.json(p)});});
		router.put('/circs/ml',(req,res)=>{index.circs.ml.update(index,req.body,(p)=>{res.json(p)});});

//	GENERAL

	//	people
		router.get('/reports/general/people',(req,res)=>{reports.general.people.get.all(reports,(p)=>{res.json(p)});});
		router.post('/reports/general/people',(req,res)=>{reports.general.people.insert(reports,req.body,(p)=>{res.json(p)});});
		router.put('/reports/general/people',(req,res)=>{reports.general.people.update(reports,req.body,(p)=>{res.json(p)});});

//	EXPORT

	module.exports = router;




