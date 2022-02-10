const express = require('express');
const router  = express.Router();
const auth   = require('../../utilities/auth.js');
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
router.get('/', (req, res) => {res.send('TNRD HUB CONSOLE..')});

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

//	DEPARTMENTS

	router.get('/departments',(req,res)=>{index.departments.get.all(index,(p)=>{res.json(p)});});
	router.get('/departments/:id',(req,res)=>{index.departments.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/departments',(req,res)=>{index.departments.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/departments',(req,res)=>{index.departments.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/departments/:id',(req,res)=>{index.departments.delete(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/departments/list',(req,res)=>{index.departments.list(index,req.body,(p)=>{res.json(p)});});

//	APPLICATIONS
	
	router.get('/applications',(req,res)=>{index.applications.get.all(index,(p)=>{res.json(p)});});
	router.get('/applications/:id',(req,res)=>{index.applications.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/applications/users/role',(req,res)=>{index.applications.users.get.byRole(index,req.body,(p)=>{res.json(p)});});
	router.put('/applications/users/role',(req,res)=>{index.applications.users.update.byRole(index,req.body,(p)=>{res.json(p)});});
	router.put('/applications',(req,res)=>{index.applications.update(index,req.body,(p)=>{res.json(p)});});
	router.post('/applications',(req,res)=>{index.applications.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/applications/:id',(req,res)=>{index.applications.delete(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/applications/list',(req,res)=>{index.applications.list(index,req.body,(p)=>{res.json(p)});});
	router.put('/applications/document',(req,res)=>{index.applications.documents.add(index,req.body,(p)=>{res.json(p)});});
	
//	ROLES

	router.get('/roles',(req,res)=>{index.roles.get.all(index,(p)=>{res.json(p)});});
	router.get('/roles/application/:id',(req,res)=>{index.roles.get.byApplication(index,req.params.id,(p)=>{res.json(p)});});
	//router.get('/roles/:id',(req,res)=>{index.roles.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/roles',(req,res)=>{index.roles.insert(index,req.body,(p)=>{res.json(p)});});
	router.post('/roles/list',(req,res)=>{index.roles.list(index,req.body,(p)=>{res.json(p)});});

//	USERS

	router.post('/users/list',(req,res)=>{index.users.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/users',(req,res)=>{index.users.get.all(index,(p)=>{res.json(p)});});
	router.get('/users/:id',(req,res)=>{index.users.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/users/bookmarks/:user',(req,res)=>{index.users.update.bookmarks(index,[req.params.user,req.body],(p)=>{res.json(p)});});
	router.post('/users/permissions/list',(req,res)=>{index.users.permissions.list(index,req.body,(p)=>{res.json(p)});});
	router.put('/users/role/',(req,res)=>{index.users.update.role(index,req.body,(p)=>{res.json(p)});});

//	PERMISSIONS

	router.post('/permissions/list',(req,res)=>{index.permissions.list(index,req.body,(p)=>{res.json(p)});});

/* 
	router.get('/users',(req,res)=>{index.users.get.all(index,(p)=>{res.json(p)});});
	router.get('/users/:id',(req,res)=>{index.users.get.byRef(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/users/profile/:id',(req,res)=>{index.users.get.byProfile(index,req.params.id,(p)=>{res.json(p)});});
	router.put('/users',(req,res)=>{index.users.update.all(index,req.body,(p)=>{res.json(p)});});
	router.put('/users/bookmarks/:user',(req,res)=>{index.users.update.bookmarks(index,[req.params.user,req.body],(p)=>{res.json(p)});});
	router.put('/users/blocked/:user/:application',(req,res)=>{index.users.role.blocked(index,[req.params.user,req.params.application,req.body],(p)=>{res.json(p)});});
	router.put('/users/role/:user/:application',(req,res)=>{index.users.role.update.all(index,[req.params.user,req.params.application,req.body],(p)=>{res.json(p)});});
	router.post('/users',(req,res)=>{index.users.insert(index,req.body,(p)=>{res.json(p)});});
	router.delete('/users/:id',(req,res)=>{index.users.delete(index,req.params.id,(p)=>{res.json(p)});});
	 */ 

//	IMAGES

	router.post('/images/list',(req,res)=>{index.images.list(index,req.body,(p)=>{res.json(p)});});
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

//	FILES

	router.post('/files/list',(req,res)=>{index.files.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/files/:id',(req,res)=>{index.files.get(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/files',upload.single('file'),(req,res)=>{
		req.file.ref = req.headers['x-application'];
		index.files.post(index,req.file,(p)=>{res.json(p)}); 
	});
	router.delete('/files/:id',(req,res)=>{index.files.delete(index,req.params.id,(p)=>{res.json(p)});});


// NOTICES
	router.get('/notices/:id',(req,res)=>{index.notices.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/notices',(req,res)=>{index.notices.get.all(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/notices/list',(req,res)=>{index.notices.list(index,req.body,(p)=>{res.json(p)});});
	router.get('/notices/patron/:id',(req,res)=>{index.notices.get.byPatron(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/notices/send/:id',(req,res)=>{index.notices.send(index,[req.params.id,req.body],(p)=>{res.json(p)});});
	router.post('/notices',(req,res)=>{index.notices.insert(index,req.body,(p)=>{res.json(p)});});
	router.put('/notices',(req,res)=>{index.notices.update(index,req.body,(p)=>{res.json(p)});});
	router.delete('/notices/:id',(req,res)=>{index.notices.delete(index,req.params.id,(p)=>{res.json(p)});});

// NOTICE ITEMS
	router.get('/notice_items/:id',(req,res)=>{index.notice_items.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	

			
//	RESOURCE LINKS
	router.get('/resource_links/application/:id',(req,res)=>{index.resource_links.get.byApplication(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/resource_links/:id',(req,res)=>{index.resource_links.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/resource_links',(req,res)=>{index.resource_links.insert(index,req.body,(p)=>{res.json(p)});});
	router.put('/resource_links',(req,res)=>{index.resource_links.update(index,req.body,(p)=>{res.json(p)});});
	router.delete('/resource_links/:id',(req,res)=>{index.resource_links.delete(index,req.params.id,(p)=>{res.json(p)});});

//	RESOURCE FILES
	router.get('/resource_files/application/:id',(req,res)=>{index.resource_files.get.byApplication(index,req.params.id,(p)=>{res.json(p)});});
	router.get('/resource_files/:id',(req,res)=>{index.resource_files.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.post('/resource_files',(req,res)=>{index.resource_files.insert(index,req.body,(p)=>{res.json(p)});});
	router.put('/resource_files',(req,res)=>{index.resource_files.update(index,req.body,(p)=>{res.json(p)});});
	router.delete('/resource_files/:id',(req,res)=>{index.resource_files.delete(index,req.params.id,(p)=>{res.json(p)});});

//	RESOURCES TYPES
	router.get('/resource_types',(req,res)=>{index.resource_types.get.all(index,(p)=>{res.json(p)});});

//	REPORTS

	router.get('/reports/:id',(req,res)=>{index.reports.get.byId(index,req.params.id,(p)=>{res.json(p)});});
	router.delete('/reports/:id',(req,res)=>{index.reports.delete(index,req.params.id,(p)=>{res.json(p)});});



//	EXPORT

	module.exports = router;




