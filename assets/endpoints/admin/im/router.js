const express = require('express');
const router  = express.Router();
const path    = require('path');
const multer  = require('multer');
const token   = require('../../../utilities/token.js');
const fs      = require('fs');
/*
	ENDPOINTS
*/

const im  = require('./index.js');  // endpoints

/*
	INVOKE
*/

im.init(im);
router.get('/', (req, res) => {res.send('TNRD API..')});


/*
	IMAGE UPLOAD
*/
var image_path = '/home/ec2-user/temp/images';
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,image_path)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    } 
});
const upload = multer({ storage: storage });


/*	
	IM (Inventory Management)
*/  

//	ACCOUNTS
		
	router.get('/profile/:id',(req,res)=>{im.profiles.get(im,req.params.id,(p)=>{res.json(p)});});
	router.post('/profile',(req,res)=>{im.profiles.insert(im,req.body,(p)=>{res.json(p)});}); 
	router.put('/profile',(req,res)=>{im.profiles.update(im,req.body,(p)=>{res.json(p)});});
	router.delete('/profile/:profile',(req,res)=>{im.profiles.delete(im,req.params.profile,(p)=>{res.json(p)});});

//	IMPORTS
	router.post('/contacts/import',(req,res)=>{im.contacts.import(im,(p)=>{res.json(p)});});
	router.post('/categories/import',(req,res)=>{im.categories.import(im,(p)=>{res.json(p)});});
	router.post('/supplies/import',(req,res)=>{im.supplies.import(im,(p)=>{res.json(p)});});
	
//	CATEGORIES
	//router.get('/departments/',token.validate,(req,res)=>{im.categories.get.departments(im,(p)=>{res.json(p)});});
	router.get('/categories/all',token.validate,(req,res)=>{im.categories.get.all(im,(p)=>{res.json(p)});});
	router.put('/category',(req,res)=>{im.categories.update.item(im,req.body.params,(p)=>{res.json(p)});});
	router.post('/category',(req,res)=>{im.categories.insert.item(im,req.body.params,(p)=>{res.json(p)});});
	router.delete('/category/:id',(req,res)=>{im.categories.delete(im,req.params.id,(p)=>{res.json(p)});});

//	SUPPLIES
	router.get('/supplies/:category',(req,res)=>{im.supplies.get.by_category(im,[req.params.category],(p)=>{res.json(p)});});
	router.post('/supplies/item',(req,res)=>{im.supplies.insert.item(im,[req.body.params],(p)=>{res.json(p)});});
	router.put('/supply',(req,res)=>{im.supplies.update.item(im,req.body.params,(p)=>{res.json(p)});});	
	router.delete('/supply/:id',(req,res)=>{im.supplies.delete.item(im,req.params.id,(p)=>{res.json(p)});});
	router.post('/supplies/search',(req,res)=>{im.supplies.get.search(im,req.body.params,(p)=>{res.json(p)});});
	router.get('/supply/image/:name',(req,res)=>{im.supplies.get.image(im,req.params.name,(p)=>{
		if(p!=='no-image'){res.sendFile(p);
		}else{
			res.end() 
		} 
	});});
	router.post('/supply/image/:id',upload.single('file'),(req,res)=>{
		req.file.id = req.params.id;
		im.supplies.insert.image(im,req.file,(p)=>{res.json(p)}); 
	});

//	CART
	router.put('/cart',(req,res)=>{im.cart.update.item(im,req.body.params,(p)=>{res.json(p)});});
	router.get('/cart/items/:reference',(req,res)=>{im.cart.get.items(im,req.params.reference,(p)=>{res.json(p)});});
	router.get('/cart/item/:reference',(req,res)=>{im.cart.get.item(im,req.params.reference,(p)=>{res.json(p)});});

//	ORDERS
	router.get('/order/:reference',(req,res)=>{im.orders.get.item(im,req.params.reference,(p)=>{res.json(p)});});
	router.get('/orders/:reference',(req,res)=>{im.orders.get.items(im,req.params.reference,(p)=>{res.json(p)});});
	router.get('/orders/by_department/:reference',(req,res)=>{im.orders.get.by_departments(im,req.params.reference,(p)=>{res.json(p)});});
	router.post('/order',(req,res)=>{im.orders.insert.item(im,req.body.params,(p)=>{res.json(p)});});
	router.put('/order/status',(req,res)=>{im.orders.update.status(im,req.body.params,(p)=>{res.json(p)});});
	router.put('/order/line_items',(req,res)=>{im.orders.update.line_items(im,req.body.params,(p)=>{res.json(p)});});
	router.put('/order/cancel',(req,res)=>{im.orders.update.cancel(im,req.body.params,(p)=>{res.json(p)});});
 
//	VENDORS
	router.get('/vendors/',(req,res)=>{im.vendors.get.all(im,(p)=>{res.json(p)});});
	router.get('/vendor/:id',(req,res)=>{im.vendors.get.item(im,req.params.id,(p)=>{res.json(p)});});
	router.put('/vendor',(req,res)=>{im.vendors.update.item(im,req.body.params,(p)=>{res.json(p)});});
	router.post('/vendor',(req,res)=>{im.vendors.insert.item(im,req.body.params,(p)=>{res.json(p)});});
	router.delete('/vendor/:id',(req,res)=>{im.vendors.delete(im,req.params.id,(p)=>{res.json(p)});});

module.exports = router;


