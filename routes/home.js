const express = require('express');
const path = require('path');
//const math = require('mathjs');

const router = express.Router();

//Main page
router.get('/', (req,res)=>{
    //Here use html markup and return
    //res.send('root page for express advanced');
    //res.render('index', {title: 'Main Page', message: 'Hello World'});
    //load code for the browser
    res.sendFile(path.join(__dirname+'/index.html'));
});

router.post('/raytracedata', function(req, res){
    //step 1: set the search object
    console.log('Recieved Data: ', req, req.body );
    //get the optical system data 
    //run the ray trace 
    //send the data 
    let json = {'idList': 'hello client world'};
    res.send(json); 
});

//send this so it can be used in index.js
module.exports = router;