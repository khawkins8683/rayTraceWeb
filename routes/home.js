const express = require('express');
const path = require('path');
//const math = require('mathjs');

const router = express.Router();

//Main page
router.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname+'/index.html'));
});

//send this so it can be used in index.js
module.exports = router;