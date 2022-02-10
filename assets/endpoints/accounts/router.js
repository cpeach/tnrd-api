const express = require('express');
const router  = express.Router();
const cognito = require('/var/server/assets/endpoints/accounts/index.js');

/* 
	ENDPOINTS
*/ 


/*
	INVOKE
*/

	cognito.init(cognito);
	router.get('/', (req, res) => {res.send('TNRD Accounts..')});

//	AUTH
	router.post('/signin',(req,res)=>{cognito.signin(cognito,req.body.params,(p)=>{res.json(p)});});
	router.post('/signup',(req,res)=>{cognito.signup(cognito,req.body.params,(p)=>{res.json(p)});});
	router.post('/signout',(req,res)=>{cognito.signout(cognito,req.body.params,(p)=>{res.json(p)});});
	router.post('/refresh',(req,res)=>{cognito.refresh(cognito,req.body.params,(p)=>{res.json(p)});});

//	PASSWORD
	router.get('/password/request/:email',(req,res)=>{cognito.password.request(cognito,req.params.email,(p)=>{res.send(p)});});
	router.post('/password/reset',(req,res)=>{cognito.password.reset(cognito,req.body.params,(p)=>{res.send(p)});});

//	DEPARTMENTS
	router.get('/departments',(req,res)=>{cognito.departments.query(cognito,{},(p)=>{res.json(p)});});
	router.get('/department/:id',(req,res)=>{cognito.departments.get.item(cognito,req.params.id,(p)=>{res.json(p)});});
	router.put('/departments',(req,res)=>{cognito.departments.update(cognito,req.body,(p)=>{res.json(p)});});
	router.post('/departments',(req,res)=>{cognito.departments.insert(cognito,req.body,(p)=>{res.json(p)});});
	router.delete('/departments/:id',(req,res)=>{cognito.departments.delete(cognito,req.params.id,(p)=>{res.json(p)});});

//	APPLICATIONS
	router.get('/applications',(req,res)=>{cognito.applications.get.all_public(cognito,(p)=>{res.json(p)});});
	router.get('/applications/:id',(req,res)=>{cognito.applications.get.public(cognito,req.params.id,(p)=>{res.json(p)});});
	router.put('/applications',(req,res)=>{cognito.applications.update(cognito,req.body,(p)=>{res.json(p)});});
	router.post('/applications',(req,res)=>{cognito.applications.insert(cognito,req.body,(p)=>{res.json(p)});});
	router.delete('/applications/:id',(req,res)=>{cognito.applications.delete(cognito,req.params.id,(p)=>{res.json(p)});});
	router.post('/applications/search',(req,res)=>{cognito.applications.query(cognito,req.body,(p)=>{res.json(p)});});

//	USERS
    router.post('/users/query',(req,res)=>{cognito.users.query(cognito,req.body.params,(p)=>{res.json(p)});});
	router.get('/users',(req,res)=>{cognito.users.query(cognito,{},(p)=>{res.json(p)});});
	router.get('/users/profile/:profile',(req,res)=>{
		cognito.users.query(cognito,{'profile.id':req.params.profile},(p)=>{p.length&&p.length>0 ? res.json(p[0]):res.json(p)});
	});
	router.get('/users/profile/:profile',(req,res)=>{
		cognito.users.query(cognito,{'profile.id':req.params.profile},(p)=>{p.length&&p.length>0 ? res.json(p[0]):res.json(p)});
	});
	router.get('/users/ref/:ref',(req,res)=>{
		cognito.users.query(cognito,{'reference':req.params.ref},(p)=>{p.length&&p.length>0 ? res.json(p[0]):res.json(p)});
	});
	router.get('/user',(req,res)=>{cognito.signup(cognito,req.body.params,(p)=>{res.json(p)});});
    router.get('/users/:application',(req,res)=>{
		cognito.users.query(cognito,{'application':req.params.application},(p)=>{res.json(p);});
	});
	router.post('/user',(req,res)=>{cognito.signup(cognito,req.body.params,(p)=>{res.json(p)});});
	router.put('/user',(req,res)=>{cognito.signup(cognito,req.body.params,(p)=>{res.json(p)});});
	router.put('/user/blocked/:user/:application',(req,res)=>{cognito.users.role.blocked(cognito,[req.params.user,req.params.application,req.body.blocked],(p)=>{res.json(p)});});
	router.put('/user/role/:user/:application',(req,res)=>{cognito.users.role.update(cognito,[req.params.user,req.params.application,req.body],(p)=>{res.json(p)});});
	router.delete('/user/:user',(req,res)=>{cognito.delete(cognito,req.params.user,(p)=>{res.json(p)});});

//	ROLES	
	router.get('/roles',(req,res)=>{cognito.roles.query(cognito,{},(p)=>{res.json(p);});});
	router.get('/roles/:application',(req,res)=>{cognito.roles.query(cognito,{application:req.params.application},(p)=>{res.json(p);});});
	router.post('/roles',(req,res)=>{cognito.roles.insert(cognito,req.body,(p)=>{res.json(p)});});

module.exports = router;


