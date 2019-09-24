//TODO --- set up for complex refractive index


//TODO --- prototypical in heritance
// combine this with trace obj
// surface instance
// planar
// spherical
// conic

//Add in Absorb surface type
//Add in aperture detection
//get this set up in node

//hard code the statuses somewhere

//------------------------------Surface -------------------------------------------------------------------
//------------------------------Surface -------------------------------------------------------------------
//------------------------------Surface -------------------------------------------------------------------
//------------------------------Surface -------------------------------------------------------------------
//------------------------------Surface -------------------------------------------------------------------

if(typeof exports != 'undefined'){
    var math = require('mathjs')
}//figure out how to load mathjs serverside here
(function(exports){

    function Surface(){}
    Surface.prototype.init = function(n1=1.0,n2=1.5,r=[0,0,0],eta=[0,0,1],sd=10,type="refract",id=1,label="comment"){
        this.id = id;//unique identifier
        this.n1 = n1;//incident material
        this.n2 = n2;//substrat material
        this.r = r;//three d postion vector
        this.k = eta;//todo allow this to be off axis
        //this.semiDiameter = sd;//only circular for now
        this.aperture = {type:"circle", semiDiameter: sd}; 
        this.type = {mode:type, system:'intermediate'};
        //this.type = type;//"reflect" or "refract"{mode:'reflect', system:'stop'/'image'/'object'/'intermediate'}
        this.label = label;
    }
    //add init shape method
    Surface.prototype.initAperture = function(sd=10){
        this.aperture = {type:"circle", semiDiameter: sd};
    }
    //Trace Methods   --------------------------------------------------------------------------------
    Surface.prototype.traceSurface = function(ray){
        //First calculate ray intercept & aoi
        let d, newR, eta;
        d = this.interceptDistance(ray);
        newR = math.add(ray.r,math.multiply(ray.k,d));
        eta = this.surfaceNormal(newR);
        //now make new ray segment -- with kIN to get the SIN and PIn vectors -- Important
        let newRay = new RaySegment(newR, ray.k, ray.lambda, eta);
        //this seems a little sketchy to me
        newRay.aoi = math.chain(eta).multiply(-1).vectorAngle(ray.k).mod(math.PI/2).done();
        newRay.type = this.type;
        newRay.surfID = this.id;
        newRay.n = {n1: this.n1, n2: this.n2};
        newRay.d = d;

        //Check to see if new r is inside the aperture
        if(! this.checkAperture(newR)) {newRay.status = -2};
        //now calculate newK 
        //switch here for reflect or refract surface   
        let newk = this.newRayDirection(eta,newRay/*ray or newRay*/);
        if(typeof newk == "number") {
            //stop status calculated
            newRay.status = newk;//returns stop status
        } else {
            //ray will contunue to propagate
            newRay.k = newk;
        }      
        return newRay;
    }
    Surface.prototype.newRayDirection = function(eta,ray){
        let newk;
        if(this.type == "refract"){
            newk = this.refract3D(this.n1, this.n2, eta, ray.k);
        }else if (this.type == "reflect"){
            newk = this.reflect3D(eta, ray.k);
        }else{
            console.log("Type Error ",this.type);
        }
        return newk;
    }
    Surface.prototype.refract3D = function(n1,n2,eta,kin){   
        let mu = (n1/n2);
        let etaXk = math.cross(eta,kin);
        let metaXk = math.cross(math.multiply(eta,-1),kin);

        let factor1 = math.multiply(mu,math.cross(eta,metaXk));
        let g1 = ((mu**2)*math.norm(etaXk)**2);
        //if g1>1 then we have TIR and kill the ray
        if(g1>1) return -2;
        let factor2 = math.multiply(eta, math.sqrt(1-g1));
        return math.subtract(factor1,factor2);
    }
    Surface.prototype.reflect3D = function(eta,kIn){
        //Reflect k accross eta
        let k = math.multiply(kIn,-1);
        let pLen = 2*math.multiply(eta,k);
        let kRef = math.chain(pLen).multiply(eta).subtract(k).done();
        return kRef;
    } 
    //default to planar surface distance
    Surface.prototype.interceptDistance = function(ray){
        let rayToCenter = math.subtract(this.r, ray.r);
        let rayeta = math.multiply(ray.k, this.k);
        return math.chain(rayToCenter).multiply(this.k).divide(rayeta).done();
    }
    Surface.prototype.checkAperture = function(newR){
        let bool = false
        if(this.aperture.type == 'circle'){
            //check to see in new R is in radial distance
            //project new R onto sysv sysa plane
            rRelative = math.subtract(this.r,newR);
            rProj = math.chain(this.k).cross(rRelative).cross(this.k).done();
            if(math.norm(rProj) < this.aperture.semiDiameter ) bool = true;
        }else{
            console.log('aperture error type');
        }
        return bool
    }
    //Paraxial/first order Methods -----------------------------------------------------
        //surface power
    Surface.prototype.power = function(){
        let p = 0;
        if(this.type == "refract"){
            p = (this.n2 - this.n1)*this.curv;
        }else{
            p = -2*this.n1*this.curv;
        }
        return p;
    }    

    Surface.prototype.EFL = function(){
        return 1/this.power();
    }

    Surface.prototype.sag = function(){
        return 0;
    }
    //---Inheritance Types ---------- Inheritance Types ---------------------------------------------------------------------------------
    //---Inheritance Types ---------- Inheritance Types -----------------------------------------------------------------------
    //---Inheritance Types ---------- Inheritance Types -----------------------------------------------------------------------
    // TODO center + eta functions!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function applyPrototype(parent,child){
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
    }
    // ---  ---- ----- --  Plane ---------------------------------------------------------------------------------------

    function Plane(){}
    applyPrototype(Surface, Plane);
    Plane.prototype.initShape = function(){this.curv=0}
    Plane.prototype.center = function(){
        return this.r;
    }
    Plane.prototype.surfaceNormal = function(){
        return math.multiply(this.k,-1);
    }

    // --- Sphere -----------------------------------------------------------------------------------------------------------
    function Sphere(){}
    applyPrototype(Surface, Sphere);
    //Add the init to the main call
    Sphere.prototype.initShape = function(curv=1){
        this.curv = curv;
    }
    //redefine the active methods
    Sphere.prototype.center = function(){
        return math.chain(this.k).multiply((1/this.curv)).add(this.r).done();
    }
    Sphere.prototype.surfaceNormal = function(newR){
        return math.chain(this.center()).subtract( newR ).normalize().multiply(-1*math.sign(this.curv) ).done();
    }
    Sphere.prototype.interceptDistance = function(ray){
        //ISSUE ----- this assumes that the curvature is not 0
        let surfR = 1/this.curv;
        //get hyp for right triangle 1 
        let L = math.subtract( this.center() ,ray.r);
        //get side 1 for right triangle 1
        let dCenter = math.multiply(L,ray.k);

        // get side 2 for right triangle 1
        let z = math.sqrt( math.multiply(L, L) - math.multiply(dCenter, dCenter) );

        //solve for last distance - side 1 right trangle 2
        let dz = math.sqrt(surfR**2 - z**2);
        let dIntercept = /*math.norm(dCenter)*/dCenter - math.sign(surfR)*dz;
        return dIntercept;
    }
    Sphere.prototype.sag = function(s){
        let num = this.curv*(s**2);
        let denom = 1 + math.sqrt(1-(1+0)*(this.curv**2)*(s**2));
        return num/denom;
    }
    //---------------------------SYSTEM---------------------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------SYSTEM----------------------------------------------
    //---------------------------SYSTEM----------------------------------------------
    //---------------------------SYSTEM----------------------------------------------
    //---------------------------SYSTEM---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //---------------------------SYSTEM----------------------------------------------
    //---------------------------SYSTEM----------------------------------------------
    //---------------------------SYSTEM-----------------------------------------------------------------------------------------------------------------------------------------------------------------
    //Utility function
    function paramToValue(param,value){
        let valueOut = value;//type and 
        if(param == 'n1'||param=='n2'||param=='curv'||param =='aperture'){
            valueOut = eval(value);
        }else if(param == 'r'||param =='k'){
            valueOut = eval('['+value+']');
            if(param == 'k') valueOut = math.normalize(valueOut);
        }
        return valueOut;
    }
    //
    function System(){}
    System.prototype.traceSystem = function(ray){
        let rayPath = [ray];
        let rayCurrent = ray;
        for (let surfId in this.system) {
            let surf = this.system[surfId];
            let newRay = surf.traceSurface(rayCurrent);
            rayPath.push(newRay);
            rayCurrent = newRay;
            if(rayCurrent.status<0) break;
        }
        let pathObj = new RayPath(rayPath);
        return pathObj;
    }
    System.prototype.maxSemiDiamter = function(){
        let max = this.surfaces[0].aperture.semiDiameter;
        for(let i=1; i<this.surfaces.length; i++){
            let sd = this.surfaces[i].aperture.semiDiameter;
            if(sd>max) max = sd;
        }
        return max;
    }
    System.prototype.createSystem = function(specs){

        let surfList = [];
        let system = {};

        for(let s in specs){
            let inputs = specs[s];
            let Constructor = eval(inputs.geometry);
            let surf = new Constructor; 
            for(let param in inputs){
                if(param == 'aperture'){
                    surf.initAperture( paramToValue(param,inputs[param]) );
                }else{
                    surf[param] = paramToValue(param,inputs[param]);
                }
            }
            surfList.push(surf);
        }
        //note this is an object and the keys should be the unique surface ids -- this should be automatically done
        for(let i=0; i<surfList.length; i++){
            surfList[i].id = i+1;
            system[i+1] = surfList[i];
        }
        this.system = system;
        this.surfaces = surfList;
    }
    System.prototype.power = function(){
        //for each surface
        let sysPow = this.surfaces[0].power();
        let pow1 = sysPow;
        //calculate the rear pricipal plane position
        let pRear = this.surfaces[0].r;//single refractive/reflective surface/ P is at surface vertex
        if(this.surfaces.length === 1) return [sysPow,pRear];
        for(let i=1; i < this.surfaces.length; i++ ){
            let surfPow = this.surfaces[i].power();
            //if type is reflect use n1
            let t = math.chain(pRear).subtract(this.surfaces[i].r).norm().done();
            sysPow = sysPow + surfPow - sysPow*surfPow*t/this.surfaces[i].n2;
            //now calculate new rear priciple plane position
            let pRearD = -1*(sysPow/pow1)*t;//this is a scalar not a vector
            pRear = math.chain(this.surfaces[i].k).multiply(pRearD).add(this.surfaces[i].k).done();
            pow1 = sysPow;
            //make sure refractive index gets canceled correctly
        }
        return [sysPow, pRear];
    }

    exports.Plane = Plane;
    exports.Sphere = Sphere;
    exports.System = System;
    
})(typeof exports === 'undefined'? this['os']={} : exports);
//module.exports = os;