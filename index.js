// get math modules
const math = require('./js/math_extend');// my extended math.js pkg
const os = require('./js/opticalSystem');
const ray = require('./js/ray')

//start express app
const express = require('express');
const app = express();
app.use('/',express.static(__dirname));
//set views
// app.set('view engine','pug');
// app.set('views','./views');
//load code for the browser
// var home_client = require('./js/home_client'),
//     sys = require('sys');
// sys.puts(home_client.test());
//get routes
const home = require('./routes/home');


//middle ware
app.use('/', home);

//configure app
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log('Express_Advance Listening on: ', port, ' in enviroment ',process.env.NODE_ENV,app.get('env'));//or app.get('env')
});