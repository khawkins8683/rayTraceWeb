
if(typeof exports != 'undefined'){
    var math = require('mathjs')
}
//Extend the javascript math package

(function(exports){
    //convert degrees to radians
    math.degree = (math.PI/180);

    math.normalize = function(vector){
        return math.divide(vector,math.norm(vector));
    }

    math.rotationMatrix = function(theta){
        const matrixList = [
            [math.cos(theta),-1*math.sin(theta)],
            [math.sin(theta),math.cos(theta)]
        ];
        return matrixList;
    }
    math.rotationMatrixX = function(theta){
        const matrixList = [
            [1,0,0],
            [0,math.cos(theta),-1*math.sin(theta)],
            [0,math.sin(theta),math.cos(theta)]
        ];
        return matrixList;
    }
    //TODO add in a rotation matrix that that takes in two vectors and rotates vector a into vector b
    math.rotationMatrixXFixed = function(theta,anchor,point){
        let rotM = math.rotationMatrixX(theta);
        let ptShift = math.subtract(point,anchor);
        return math.chain(rotM).multiply(ptShift).add(anchor).done();
    }

    math.vectorAngle = function(v1,v2){
        return math.acos(math.multiply(v1,v2)/(math.norm(v1)*math.norm(v2)));
    }

    math.quadraticFormula = function(a,b,c){
        let f = math.chain(b).multiply(-1).divide(a).divide(2).done();
        let ac4 = math.chain(a).multiply(c).multiply(4).done();
        let sqrt = math.chain(b).pow(2).subtract(ac4).sqrt().divide(a).divide(2).done();
        let out1 = math.add(f,sqrt);
        let out2 = math.subtract(f,sqrt);
        return [out1,out2];
    }

    math.eigenValues2D = function(matrix){
        let a = -1;
        let b = math.add(matrix[0][0],matrix[1][1]);
        let c = math.subtract(math.multiply(matrix[0][1],matrix[1][0]),math.multiply(matrix[0][0],matrix[1][1]));
        return math.quadraticFormula(a,b,c);
    }
    math.eigenVectors2D = function(matrix){
        let eValues = math.eigenValues2D(matrix);
        let vectors = [];
        for(let i =0; i<eValues.length; i++){
            matrix[0][0] = matrix[0][0]-eValues[i];
            matrix[1][1] = matrix[1][1]-eValues[i];
            vectors.push(math.usolve(matrix,[0,0]));
        }
        return vectors;
    }

    exports = math;

})(typeof exports === 'undefined'? this['os']={} : exports);

