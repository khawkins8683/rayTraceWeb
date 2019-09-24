//dependencies
if(typeof exports != 'undefined'){
    var math = require('mathjs')
}//figure out how to load mathjs serverside here
(function(exports){

///SEGMENT ------------------------------------------------------------------------------------------
///SEGMENT ------------------------------------------------------------------------------------------
///SEGMENT ------------------------------------------------------------------------------------------
///SEGMENT ------------------------------------------------------------------------------------------
/// We want the rayPath and possibly rayField to inherit diattenuation + retardance functions if possible

    //todo set up defuatlts for eta opl, surfID,n and aoi
    function RaySegment(r=[0,0,0],k=[0,0,1],lambda=550,eta=[0,0,1],d=0,surfID=0,nObj={n1:1,n2:1},aoi=0,type="refract"){
        //should probably add a unique id to each ray
        this.surfID = surfID;
        //this.n = n;//refractive index
        this.r = r;//3D location
        this.k = k;//3D propagation direction
        this.eta = eta;
        this.sIn = this.sOutVector();
        this.pIn = this.pOutVector();

        this.d = d;//prop distance, not OPL!
        this.flux = 1;//calculate absorbtion due to bbers law
        
        this.lambda = lambda;//nm
        //methods ray.rs ray.rp ray.PRT
        this.n = nObj;
        //this.n = {n1:n1,n2:n2};
        this.aoi = aoi;
        this.type = type;//either reflect or refract
        this.status=1;//1>alive -1=> missed -2 => TIR
    }
    //OPL Calculation
    RaySegment.prototype.OPL = function(){
        let n = this.n.n1;
        //check for complex n
        if(typeof n == "object"){
            n = n.re;
        }
        return n*this.d;
    }
    //Fresnel Caclculus------------------------------------------------------------------------------------
    //TODO - these need to be made into complex friendly index functions
    //Coefficients
    RaySegment.prototype.cosTheta2 = function(){
        let nfactor = math.divide(this.n.n1 , this.n.n2);
        let sin = math.sin(this.aoi);
        let sinFactor = math.chain(nfactor).multiply(sin).pow(2).done();
        return math.chain(1).subtract(sinFactor).sqrt().done();
    }
    //Reflection
    RaySegment.prototype.rs = function(){
        let n1theta1 = math.multiply(this.n.n1, math.cos(this.aoi));
        let n2theta2 = math.multiply(this.n.n2, this.cosTheta2());
        let num = math.subtract(n1theta1, n2theta2);
        let denom = math.add(n1theta1, n2theta2);
        return math.divide(num,denom);
    }
    RaySegment.prototype.rp = function(){
        let n1theta2 = math.multiply(this.n.n1 , this.cosTheta2());
        let n2theta1 = math.multiply(this.n.n2 , math.cos(this.aoi));
        let num = math.subtract(n1theta2 , n2theta1);
        let denom = math.add(n1theta2 , n2theta1);
        return math.divide(num,denom);
    }
    RaySegment.prototype.Rs = function(){
        return math.norm(this.rs())**2
    }
    RaySegment.prototype.Rp = function(){
        return math.norm(this.rp())**2
    }
    //Transmission
    RaySegment.prototype.ts = function(){
        let n1theta1 = math.multiply(this.n.n1,math.cos(this.aoi));
        let n2theta2 = math.multiply(this.n.n2,this.cosTheta2()); 
        let num = math.multiply(2, n1theta1); 
        let denom = math.add(n1theta1 , n2theta2);
        return math.divide(num,denom);
    }
    RaySegment.prototype.tp = function(){
        let n1theta1 = math.multiply(this.n.n1 , math.cos(this.aoi));
        let n1theta2 = math.multiply(this.n.n1 , this.cosTheta2());
        let n2theta1 = math.multiply(this.n.n2 , math.cos(this.aoi));
        let num = math.multiply(2,n1theta1);
        let denom = math.add(n1theta2 , n2theta1)
        return math.divide(num,denom);//(2*n1theta1) / (n1theta2 + n2theta1);
    }
    RaySegment.prototype.transmissionFactor = function(){
        let nfactor = math.divide(this.n.n2,this.n.n1);
        let cosfactor = math.divide(this.cosTheta2(),math.cos(this.aoi));
        return math.multiply(nfactor,cosfactor);
    }
    RaySegment.prototype.Ts = function(){
        return 1 - this.Rs();//this is the easy way but for coatings we might need to use transmissionFactor
    }
    RaySegment.prototype.Tp = function(){
        return 1 - this.Rp();
    }

    //// GEOMETRY ---------------------------------------------------------------
    RaySegment.prototype.kInVector = function(){
        return math.cross(this.sIn,this.pIn);
    }
    RaySegment.prototype.sOutVector = function(){
        let len = math.chain(this.k).subtract(this.eta).norm().round(10).done();
        let sOut = [0,0,0];
        if(len == 0||len==2){//check if parallel or anti parallel
            sOut = [1,0,0];//TODO ---- if k and eta are x than this is bad
        }else{
            //console.log("in else");
            sOut = math.chain(this.k).cross(this.eta).normalize().done();
        }
        //console.log("Constructing sOut, at surface"+this.surfID,"sOut",sOut);
        return sOut;
    }
    RaySegment.prototype.pOutVector = function(){
        return math.cross(this.k, this.sOutVector() );
    }
    //for PRT -------------------------------------------------
    RaySegment.prototype.oOut = function(){
        //console.log("Constructing oOut, at surface"+this.surfID,"sOut",this.sOutVector());
        //console.log("Constructing oOut, at surface"+this.surfID,"pOut",this.pOutVector());
        //console.log("Constructing oOut, at surface"+this.surfID,"kOut",this.k);
        return math.transpose([this.sOutVector(),this.pOutVector(),this.k]);
    }
    RaySegment.prototype.oInInverse = function(){
        return [this.sIn,this.pIn,this.kInVector()];
    }
    RaySegment.prototype.PRT = function(){
        let coefs = {};
        if(this.type == "reflect"){
            coefs.s = this.rs();
            coefs.p = this.rp();
        }else{
            coefs.s = this.ts();
            coefs.p = this.tp();       
        }
        //console.log("constructing prt at surface "+this.surfID,"{s,p}",coefs);
        let jm3D = [[coefs.s,0,0], [0,coefs.p,0], [0,0,1]];
        //console.log("constructing prt at surface "+this.surfID,"{oIn}", this.oInInverse());
        //console.log("constructing prt at surface "+this.surfID,"{oOut}", this.oOut());
        return math.chain(this.oOut()).multiply(jm3D).multiply(this.oInInverse()).done();
    }
    RaySegment.prototype.Q = function(){
        return math.chain(this.oOut()).multiply(math.identity(3)._data).multiply(this.oInInverse()).done();
    }
    ///Polarization properties ------------------------------------------
    RaySegment.prototype.retardance = function(){
        let coefs = {};
        if(this.type == "reflect"){
            coefs.s = this.rs();
            coefs.p = this.rp();
        }else{
            coefs.s = this.ts();
            coefs.p = this.tp();       
        }
        //these are complex valued
        //might need to take modulus - think
        return math.arg(coefs.s) - math.arg(coefs.p);
    }
    RaySegment.prototype.diattenuation = function(){
        let intensityCoefs = {};
        if(this.type == "reflect"){
            intensityCoefs.s = this.Rs();
            intensityCoefs.p = this.Rp();
        }else{
            intensityCoefs.s = this.Ts();
            intensityCoefs.p = this.Tp();       
        }
        //these are all real valued
        return math.abs(intensityCoefs.s - intensityCoefs.p) / (intensityCoefs.s + intensityCoefs.p);
    }
    //Angles ---------------------
    RaySegment.prototype.xAngle = function(){
        let x = math.sqrt(math.add(math.pow(this.k[1],2), math.pow(this.k[2],2) ));
        return math.atan(math.divide(this.k[0],x));
    }
    RaySegment.prototype.yAngle = function(){
        let x = math.sqrt(math.add(math.pow(this.k[2],2), math.pow(this.k[0],2) ));
        return math.atan(math.divide(this.k[1],x));
    }
    RaySegment.prototype.zAngle = function(){
        let x = math.sqrt(math.add(math.pow(this.k[0],2), math.pow(this.k[1],2) ));
        return math.atan(math.divide(this.k[2],x));
    }

    /// Ray Path -----------------------------------------------------------------------------------------------------------
    /// Ray Path ---------------------------------------------------------------------------------------------------------------
    /// Ray Path -----------------------------------------------------------------------------------------------------
    /// Ray Path ------------------------------------------------------------------------------------
    /// Ray Path ------------------------------------------------------------------------------------
    /// Ray Path ------------------------------------------------------------------------------------
    function RayPath(rayList){
        this.rayList = rayList;
    }

    RayPath.prototype.OPLTotal = function(surfID=this.rayList.length){
        let rays = this.rayList;
        let opl = 0;
        for(let i=0; i<surfID; i++){
            opl += rays[i].OPL();
        }
        return opl;
    }
    RayPath.prototype.PRTTotal = function(surfID=this.rayList.length){
        let rays = this.rayList;
        let prt = math.identity(3)._data;
        for(let i=surfID-1; i>=0; i--){
            prt = math.multiply(prt, rays[i].PRT());
        } 
        return prt;
    }
    RayPath.prototype.QTotal = function(surfID=this.rayList.length){
        let rays = this.rayList;
        let q = math.identity(3)._data;
        for(let i=surfID-1; i>=0; i--){
            q = math.multiply(q, rays[i].Q());
        } 
        return q;
    }
    RayPath.prototype.jonesMatrix = function(surfID=this.rayList.length){
        let jones3D = math.chain(this.QTotal(surfID)).inv().multiply(this.PRTTotal(surfID)).done();
        //now take the first 4 elements
        let jones = [jones3D[0].slice(0,2), jones3D[1].slice(0,2)];
        return jones;
    }
    RayPath.prototype.retardance = function(surfID=this.rayList.length){
        //step 1 - convert to jm
        let eigen = math.eigenValues2D(this.jonesMatrix(surfID));
        return math.arg(eigen[0]) - math.arg(eigen[1]);
    }
    RayPath.prototype.diattenuation = function(surfID=this.rayList.length){
        //step 1 - convert to jm
        //think about if we need transmission factor here
        let eigen = math.eigenValues2D(this.jonesMatrix(surfID));
        let t1 = math.chain(eigen[0]).norm().pow(2).done();
        let t2 = math.chain(eigen[1]).norm().pow(2).done();
        return math.abs(t1-t2)/(t1+t2);
    }
    RayPath.prototype.eigenStates = function(surfID=this.rayList.length){
        return math.eigenVectors2D(this.jonesMatrix(surfID));
    }
    //// Selection
    RayPath.prototype.getSurfaceRay = function(id){
        for(let i=0; i<this.rayList.length; i++){
            if(this.rayList[i].surfID == id){
                return this.rayList[i];
            }
        }
    }
    /////-------------RayGrid------------------------------------------------------------------------------------
    /////-------------RayGrid------------------------------------------------------------------------------------
    /////-------------RayGrid------------------------------------------------------------------------------------
    /////-------------RayGrid------------------------------------------------------------------------------------
    /////-------------RayGrid------------------------------------------------------------------------------------
    //prototypes 
    function CollimatedWavefrontGrid(n,r,rayRChief=[0,0,0],rayK=[0,0,1],lambda=550){
        
        //make a circular ray grid centered around rayR
        let rayGrid = [];
        let rayRow = [];
        let xl, yl = 0;

        for(let x = 0; x<=n; x++){
            rayRow = [];
            xl = (x*(2*r)/n - r);
            for(let y = 0; y<=n; y++){
                yl = (y*(2*r)/n - r);
                rayRow.push(new RaySegment([rayRChief[0]+xl,rayRChief[1]+yl,rayRChief[2]],rayK,lambda));
            }
            rayGrid.push(rayRow);
        }
        this.rayGridIn = rayGrid;
        this.rayGridOut = [];
    }
    CollimatedWavefrontGrid.prototype.traceGrid = function(trace, sys){
        let gridOut = [];
        let rowOut = [];
        for(let i=0; i<this.rayGridIn.length; i++){
            rowOut = [];
            for(let j=0; j<this.rayGridIn[i].length; j++){
                rowOut.push(trace.traceSystem(this.rayGridIn[i][j],sys));
            }
            gridOut.push(rowOut);
        }
        this.rayGridOut = gridOut;
    }

    /// Ray Field 
    function RayField(pathList){
        this.rayPaths = pathList;
    }
    //TODO - add field info
        //image height
        //obj distance
        //obj height
        //field angle

    //Now combine the functions into a single ray object to pass to npm
    
    exports.CollimatedWavefrontGrid = CollimatedWavefrontGrid;
    exports.RayPath = RayPath;
    exports.RaySegment = RaySegment;
    exports.RayField = RayField;

})(typeof exports === 'undefined'? this['ray']={} : exports);
//module.exports = ray;