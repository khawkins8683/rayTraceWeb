//function that takes os object and gives list of surfaces --------------------- ------------- -------------- ------------- ------------------ ------ 
surfaceTypes = function(os){
    let typeList = []
    for(t in os){
        typeList.push(t)
    }
    return typeList
}

//function that takes a surface type and returns a list of inputs   ---------------------------- --------- ---- --------------
inputList = function(os,surfType){
    let surfDef = new os[surfType];
    surfDef.init();
    surfDef.initShape();//initialize geometry
    surfDef.initAperture();
    let inputs = Object.getOwnPropertyNames(surfDef);
    let inputList = []
    for(let i = 0; i<inputs.length; i++){
        prop = inputs[i];
        inputList.push([ prop, surfDef[prop] ]);
    }
    return inputList
}
function paramType(param){
    let t = 'text';
    if(param == 'n1'||param=='n2'||param=='curv'){
        t = 'number';
    }
    return t;
}


let sID = 0;
function addSurfaceInput(os, surfType){
    sID++;
    let inputs = inputList(os,surfType);
    //create s surface row
    let row = document.createElement('TR');
    let item = document.createElement("TD");
    item.innerHTML = surfType;
    row.append(item);
    //for each surface add an input
    for(let i=0; i<inputs.length; i++){
        if(inputs[i][0] === 'id'){
            item = document.createElement("TD");
            item.innerHTML = sID
        }else{
            item = document.createElement("TD");
            let input = document.createElement('INPUT');
            input.className = 'surfProp';
            input.setAttribute('type',paramType(inputs[i][0]));//todo change by type string array number
            input.onchange = setSysPower;
            if(inputs[i][0] === 'aperture'){
                input.value = inputs[i][1].semiDiameter;
            }else{
                input.value = inputs[i][1];
            }
            
            item.append(input)
        }
        item.setAttribute('name',inputs[i][0]);
        row.append(item);
    }
    let lp = document.getElementById('lensPrescription');
    lp.append(row)
}

//MAin -------------------------------
//Table headings
let inputs = inputList(os,"Sphere");
let lp = document.getElementById('lensPrescription');
let row = document.createElement("TR");
let item = document.createElement("TH");
item.innerHTML = 'type';
item.className = 'surfProp';
row.append(item)
for(let i=0; i<inputs.length; i++){
    item = document.createElement("TH");
    item.innerHTML = inputs[i][0];
    item.className = 'surfProp';
    row.append(item)
}
lp.append(row)

let typeList = surfaceTypes(os);
let dropDiv = document.getElementById('myDropdown');
for(let i = 0; i<typeList.length; i++){
    let aTag = document.createElement("A");
    aTag.innerHTML = typeList[i];
    //add a click event
    aTag.onclick = function(){
        addSurfaceInput(os, typeList[i])
    }
    dropDiv.append(aTag);
}

//Add surface btn
let surfBTN = document.getElementById('surfbtn');
surfBTN.onclick = function(){
    document.getElementById("myDropdown").classList.toggle("show");
}
//surface power
setSysPower = function(){
    let sys = new os.System;//this should be defined globally and just updated
    sys.createSystem(getOpticalSystemData());
    let power = sys.power()[0];
    let powerNode = document.getElementById('powerbox');
    powerNode.innerHTML = 'System Power: ' + power;
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


/// Server communication ------------------------------------------ ---------------------- ------------------ ------------- -
function getOpticalSystemData(){
    let lp = document.getElementById('lensPrescription');
    let surfaceRows = lp.children;
    let opticalSystem = {}
    //console.log(surfaceRows);
    for(let i =1; i<surfaceRows.length; i++){
        let inputs = surfaceRows[i].children;
        let surfData  = {
            'id':i,
            'geometry':inputs[0].innerHTML
        }
        opticalSystem['surf'+i] = surfData
        for(let j=2; j<inputs.length; j++){
            // we can skip surface id and just use j for now
            let name = inputs[j].getAttribute('name');
            surfData[name] = inputs[j].children[0].value;
        }
    }
    return opticalSystem;
}

function displayRayTaceData(data){
    console.log('in cb',data)
}
function postRayTrace(url,cb){// the cb will act on the recieved ray trace data 
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST"/*method*/,url/* sever route */, true/*asyn t/f */);//used with the send method
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.onreadystatechange = function(){
        if (xhttp.readyState == 4 && xhttp.status == 200) {
            let data;  
            try {
                data = JSON.parse(xhttp.responseText); 
            } catch (error) {
               console.log(error);
               return; 
            }  
            console.log('Ajax recieved Data: ',data);
            cb(data);
        }
    }
    //Send optical system data 
    let data = getOpticalSystemData();
    console.log('sending data ', JSON.stringify(data) );
    dataSend = JSON.stringify(data);
    xhttp.send(JSON.stringify(data));//send a request to the server
}
let dataSend = {};
let traceBTN = document.getElementById('tracebtn');
traceBTN.onclick = function(){
    postRayTrace('/tracedata',displayRayTaceData)
}