const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
	res.send('Welcome to the AWS TNRD API..   '+ req.query)
});



module.exports = router;