const math = require('./js/math_extend');// my extended math.js pkg
const os = require('./js/opticalSystem');
const ray = require('./js/ray')

console.log("adding [1,0] & [0,2]",math.add([1,0],[0,2]));
console.log("testing extended math object ",math.normalize([1,1]));

rayIn1 = ray.newSegment([0,0,0]);
rayIn2 = ray.newSegment([0,0,1]);

console.log(rayIn1);
console.log(rayIn2);

let s1 = os.newSurface(1.0,1.5,[0,0,1],[0,0,1]);
let s2 = os.newSurface(1.5,1.0,[0,0,2],[0,0,1]);

// console.log(s1);
// console.log(s2);


