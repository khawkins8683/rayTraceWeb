// get math modules
const math = require('./js/math_extend');// my extended math.js pkg
const os = require('./js/opticalSystem');
const ray = require('./js/ray')

//start express app
const express = require('express');
const app = express();

//get routes
const home = require('./routes/home');
const tracedata = require('./routes/tracedata');

//configure middleware
app.use(express.static(__dirname));
app.use(express.json());
//configure routes
app.use('/', home);
app.use('/', tracedata);

//configure app
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log('Express_Advance Listening on: ', port, ' in enviroment ',process.env.NODE_ENV,app.get('env'));//or app.get('env')
});