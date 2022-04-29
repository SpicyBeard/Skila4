const express = require('express');
const router = express();
const path = require('path');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

// Milliforrit fyrir tíma
var requestTime = (req, res, next) => { 
    req.requestTime = new Date(); 
    // köllum á næsta milliforriti í röðinni   
    next(); 
};
  
router.use(requestTime);
  
router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/login.html'));
});

router.post('/', (req, res) => {
	var password = req.body.password;
	console.log('innslegið lykilorð var: '+password);
	res.redirect('/'+password);
});

router.get('/BigBen', (req, res) => { 
    res.sendFile(path.join(__dirname + '/index.html')); 
    // með næstu skipun getum við séð í console hvenær beiðni barst 
    console.log('Site visitor arrived at: '+req.requestTime); 
}); 
  
router.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname + '/No_Access.html'));
    // res.redirect('/');
});

module.exports = router;