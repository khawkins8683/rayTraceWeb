

//function that takes os object and gives list of surfaces
surfaceTypes = function(os){
    typeList = []
    for(t in os){
        typeList.push(t)
    }
    return typeList
}

//function that takes a surface type and returns a list of inputs
inputList = function(os,surfType){
    let surfDef = new os[surfType]
    surfDef.init()
    inputs = Object.getOwnPropertyNames(surfDef);
    inputList = []
    for(let i = 0; i<inputs.length; i++){
        prop = inputs[i];
        inputList.push([ prop, surfDef[prop] ]);
    }
    return inputList
}

//function 
function selectSurfaces(os) {
    //create a buch of a tags
    let typeList = surfaceTypes(os);
    let dropDiv = document.getElementById('myDropdown');
    document.getElementById("myDropdown").classList.toggle("show");
    for(let i = 0; i<typeList.length; i++){
        let aTag = document.createElement("A");
        aTag.innerHTML = typeList[i];
        //add a click event
        aTag.onclick = function(){
            addSurfaceInput(os, typeList[i])
        }
        dropDiv.append(aTag);
    }
}

function addSurfaceInput(os, surfType){
    let inputs = inputList(os,surfType);
    //create s surface div
    let surfDiv = document.createElement('DIV');
    surfDiv.className = 'surface';
    //for each surface add an input
    for(let i=0; i<inputs.length; i++){
        let input = document.createElement('INPUT');
        input.setAttribute('type','text');//todo change by type string array number
        input.value = inputs[i][1];
        surfDiv.append(input)
    }
    let lp = document.getElementById('lensPrescription');
    lp.append(surfDiv)
}

let surfBTN = document.getElementById('surfbtn');
surfBTN.onclick = function(){
    selectSurfaces(os);//os to be loaded
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