const express = require('express');
const path = require('path');
//const math = require('mathjs');

const router = express.Router();

//load os module
// var home_client = require('../js/home_client'),
//     sys = require('util');

// console.log(home_client.test())
const os = require('../js/opticalSystem');
let s1 = new os.Surface();
s1.init(1,1.5,[0,0,0],[0,0,1],2);
console.log(s1,s1.reflect3D([0,0,1],[0,0,1]))

//Main page
router.get('/', (req,res)=>{
    //Here use html markup and return
    //res.send('root page for express advanced');
    //res.render('index', {title: 'Main Page', message: 'Hello World'});
    //load code for the browser

    res.sendFile(path.join(__dirname+'/index.html'));
});

//send this so it can be used in index.js
module.exports = router;