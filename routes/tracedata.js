const express = require('express');
const os = require('../js/opticalSystem')

const router = express.Router();


router.post('/tracedata', function(req, res){
    console.log('Recieved Data: ', req.body );
    let sys = new os.System;
    sys.createSystem(req.body);//JSON.parse(req.body));
    console.log(sys.surfaces);
    //get the optical system data 
    //run the ray trace 
    //send the data 
    let json = {'idList':  sys.surfaces[0].id };
    res.send(json); 
});


console.log('running trace data')
module.exports = router;