const express = require('express');
const router  = express.Router();
const token   = require('../../utilities/token.js');

/*
	ENDPOINTS
*/

const ils = require('./ils.js'); 

/*
	INVOKE
*/
ils.init(ils);

router.get('/', (req, res) => {res.send('AWS Library API..')});

/*	
	ILS (Integrated Library System)
*/

//	TEST 
	router.get('/ils/test/connection/alexandria',(req,res)=>{ils.set.test.connection.alexandria(ils,[],(p)=>{res.json(p);});});
	router.get('/ils/test/connection',(req,res)=>{ils.set.test.connection(ils,[],(p)=>{res.json(p);});});
	router.get('/ils/ping',(req,res)=>{ils.ping(ils,(p)=>{res.json(p);});});

	

//	ROOT 
	router.get('/ils', (req, res) => {res.send('Library APIs');});

//	ACCOUNT
	router.post('/ils/profile/validate',(req,res)=>{ils.profiles.validate(ils,req.body.params,(p)=>{res.json(p);});});
	router.get('/ils/profile/:id',(req,res)=>{ils.profiles.get(ils,req.params.id,(p)=>{res.json(p)});});
	router.post('/ils/profile',(req,res)=>{ils.profiles.insert(ils,req.body,(p)=>{res.json(p)});});
	router.put('/ils/profile',(req,res)=>{ils.profiles.update(ils,req.body.params,(p)=>{res.json(p)});});
	router.delete('/ils/profile',(req,res)=>{ils.profiles.delete(ils,req.body.params,(p)=>{res.json(p)});});
	 

//	AUTH

	router.get('/ils/refresh',(req,res)=>{api.jwt.refresh(api,[req,res],(p)=>{res.json(p)});});
	router.post('/ils/register',(req,res)=>{ils.register(ils,req.body.params,(p)=>{res.json(p)});});
	router.post('/ils/login',(req,res)=>{ils.login(ils,req.body.params,(p)=>{res.json(p)});});


//	PATRON 
	
	router.post('/ils/patron/validate',(req,res)=>{ils.get.patron.validate(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/patron/info',token.validate,(req,res)=>{ils.get.patron.info(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/_patron/info',(req,res)=>{ils.get.patron.info(ils,[req.body.params],(p)=>{res.json(p);});});
  	router.post('/ils/set/patron/info/address',(req,res)=>{ils.set.patron.info.address(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/patron/list',(req,res)=>{ils.get.patron.list(ils,[req.body.params],(p)=>{res.json(p);});});
  	router.post('/ils/patron/list/ids',(req,res)=>{ils.get.patron.list_by_id(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/patron/list/postalcodes',(req,res)=>{ils.get.patron.list_by_postal_code(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/patron/info/formattedaddress',(req,res)=>{ils.get.patron.formatted_address(ils,[req.body.params.address],(p)=>{res.json(p);});});
	router.post('/ils/patron/query',(req,res)=>{ils.get.patron.query(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/patron/create',(req,res)=>{ils.set.patron.record.temporary(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/patron/confirm',(req,res)=>{ils.set.patron.record.confirm_temp_patron(ils,[req.body.params],(p)=>{res.json(p);});});

// 	SEARCH
	router.get('/ils/search/title/:title',(req,res)=>{ils.get.search.title(ils,[req.params.title],(p)=>{res.json(p);});});
	router.post('/ils/search/text',(req,res)=>{ils.get.search.text(ils,[req.body.params],(p)=>{res.json(p);});});

//  BIBS
  router.post('/ils/bibs/id',(req,res)=>{ils.get.bib(ils,[req.body.params.bib],(p)=>{res.json(p);});});
  router.post('/ils/bibs/marc',(req,res)=>{ils.get.marc(ils,[req.body.params],(p)=>{res.json(p);});});
  //router.post('/ils/bibs/cover',(req,res)=>{ils.get.cover(ils,[req.body.params],(p)=>{res.json(p);});});

/*	
	ITEMS
*/ 
 router.post('/ils/item/query',(req,res)=>{ils.get.item.query(ils,[req.body.params],(p)=>{res.json(p);});});

/*	
	PROGRAMS
*/ 


	// 	TIME
  router.post('/ils/programs/program/time',(req,res)=>{ils.get.programs.time(ils,[req.body.params],(p)=>{res.json(p);});});

	// 	PROGRAM
	router.post('/ils/programs/program/sections/sessions',(req,res)=>{ils.get.programs.sessions(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/programs/program/sections',(req,res)=>{ils.get.programs.sections(ils,[req.body.params],(p)=>{res.json(p);});});
	router.post('/ils/programs/program/',(req,res)=>{ils.get.programs.program(ils,[req.body.params],(p)=>{res.json(p);});});
  
	// 	MONTH
	router.post('/ils/programs/month/',(req,res)=>{ils.get.programs.month(ils,[req.body.params],(p)=>{res.json(p);});});

	// 	UPCOMING
	router.post('/ils/programs/upcoming/',(req,res)=>{ils.get.programs.upcoming(ils,[req.body.params],(p)=>{res.json(p);});});



/*
 LIBCAL
*/

router.get('/libcal/test/connection', (req, res) => {ils.set.test.connection.libcal(ils,[],(p)=>{res.json(p);});});
router.post('/libcal/patron/validate',(req,res)=>{ils.get.patron.libcal_validate(ils,[req.body],(p)=>{res.json(p);});});

// 	UPCOMING
router.post('/libcal/programs/upcoming',(req,res)=>{ils.get.programs.upcoming(ils,[req.body],(p)=>{res.json(p);});});

// MOBILE LIBRARY
router.post('/libcal/mobilelibrary/stops/upcoming/',(req,res)=>{ils.get.mobile_library.stops.upcoming.all(ils,[req.body],(p)=>{res.json(p);});});
module.exports = router;



