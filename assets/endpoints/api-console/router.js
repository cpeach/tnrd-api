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
router.get('/', (req, res) => {res.send('TNRD HUB API..')});

/*
	IMAGE UPLOAD
*/
var image_path = '/home/ec2-user/temp/images';
var storage = multer.diskStorage({
    destination: (req, file, cb) => {cb(null,image_path)},
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    } 
});
const upload = multer({ storage: storage });

//  VALIDATE

	router.get('/validate',token.validate,(req,res)=>{res.json(true)});
	router.get('/refresh/:id',token.validate,async (req,res)=>{
		var token = req.headers.authorization?req.headers.authorization.split("Bearer ")[1]:'';
		index.refresh(index,[req.params.id,req.headers['x-application'],token],(p)=>{res.json(p)});
	});

//	PROFILES

	router.get('/profile/:id',(req,res)=>{index.profiles.get(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/profile',(req,res)=>{index.profiles.insert(index,req.body,(p)=>{res.json(p)});});
	router.put('/profile',(req,res)=>{index.profiles.update(index,req.body,(p)=>{res.json(p)});});
	router.delete('/profile/:profile',(req,res)=>{index.profiles.delete(index,req.params.profile,(p)=>{res.json(p)});});

//	DEPARTMENTS

	router.get('/departments',(req,res)=>{index.departments.get.all(index,(p)=>{res.json(p)});});
	router.get('/departments/:id',(req,res)=>{index.departments.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/departments',(req,res)=>{index.departments.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/departments',(req,res)=>{index.departments.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/departments/:id',(req,res)=>{index.departments.delete(index,req.params.id,(p)=>{res.json(p)});});


	

	
//	APPLICATIONS

	router.get('/applications',token.validate,(req,res)=>{index.applications.get.all(index,(p)=>{res.json(p)});});
	router.get('/applications/:id',(req,res)=>{index.applications.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/applications',(req,res)=>{index.applications.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/applications',(req,res)=>{index.applications.insert(index,req.body,(p)=>{res.json(p)});});
	router.post('/applications/search',(req,res)=>{index.applications.query.all(index,req.body,(p)=>{res.json(p)});});
	router.delete('/applications/:id',(req,res)=>{index.applications.delete(index,req.params.id,(p)=>{res.json(p)});});

//	ROLES

	router.get('/roles',(req,res)=>{index.roles.get.all(index,(p)=>{res.json(p)});});
	router.get('/roles/application/:id',(req,res)=>{index.roles.get.byApplication(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/roles',(req,res)=>{index.roles.insert(index,req.body,(p)=>{res.json(p)});});
	
//	USERS

	router.get('/users',(req,res)=>{index.users.get.all(index,(p)=>{res.json(p)});});
	router.get('/users/:id',(req,res)=>{index.users.get.byRef(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/users/profile/:id',(req,res)=>{index.users.get.byProfile(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/users',(req,res)=>{index.users.update.all(index,req.body,(p)=>{res.json(p)});});
	router.put('/users/bookmarks/:user',(req,res)=>{index.users.update.bookmarks(index,[req.params.user,req.body],(p)=>{res.json(p)});});
	router.put('/users/blocked/:user/:application',(req,res)=>{index.users.role.blocked(index,[req.params.user,req.params.application,req.body],(p)=>{res.json(p)});});
	router.put('/users/role/:user/:application',(req,res)=>{index.users.role.update.all(index,[req.params.user,req.params.application,req.body],(p)=>{res.json(p)});});
	router.post('/users',(req,res)=>{index.users.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/users/:id',(req,res)=>{index.users.delete(index,req.params.id,(p)=>{res.json(p)});});
	
//	IMAGES

	router.get('/images/:id',(req,res)=>{index.images.get(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/images',upload.single('image'),(req,res)=>{
		req.file.ref = req.headers['x-application'];
		index.images.post(index,req.file,(p)=>{res.json(p)}); 
	});
	router.delete('/images/:id',(req,res)=>{index.images.delete(index,req.params.id,(p)=>{res.json(p)});});
	
//	DOCUMENTS

	router.get('/documents/:id',(req,res)=>{index.documents.get(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/documents',upload.single('document'),(req,res)=>{
		req.file.ref = req.headers['x-application'];
		index.documents.post(index,req.file,(p)=>{res.json(p)}); 
	});
	router.delete('/documents/:id',(req,res)=>{index.documents.delete(index,req.params.id,(p)=>{res.json(p)});});
		

//	EXPORT

	module.exports = router;




