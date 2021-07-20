// Raytracing of a revolving triangle in Javasctipt

let Origin = {x:0.0, y:0.0, z:0.0};

// Rotational Matrix
function Rmatrix (r) {
     return [
          [Math.cos(r.c)*Math.cos(r.b), Math.cos(r.c)*Math.sin(r.b)*Math.sin(r.a), Math.cos(r.c)*Math.sin(r.b)*Math.cos(r.a)+Math.sin(r.c)*Math.sin(r.a)],
          [Math.sin(r.c)*Math.cos(r.b), Math.sin(r.c)*Math.sin(r.b)*Math.sin(r.a), Math.sin(r.c)*Math.sin(r.b)*Math.cos(r.a)-Math.cos(r.c)*Math.sin(r.a)],
          [-Math.sin(r.b), Math.cos(r.b)*Math.sin(r.a), Math.cos(r.b)*Math.cos(r.a)]
     ]
}

function vertex_globalPos (vertex, translation, rotation){
     return {
          x: translation.x + vertex.x*Rmatrix(rotation)[0][0] + vertex.y*Rmatrix(rotation)[0][1] + vertex.z*Rmatrix(rotation)[0][2],
          y: translation.y + vertex.x*Rmatrix(rotation)[1][0] + vertex.y*Rmatrix(rotation)[1][1] + vertex.z*Rmatrix(rotation)[1][2],
          z: translation.z + vertex.x*Rmatrix(rotation)[2][0] + vertex.y*Rmatrix(rotation)[2][1] + vertex.z*Rmatrix(rotation)[2][2]
     }
}

Vector = {}

// tridimentional vector from point A to point B
Vector.fromPoints = function(A,B) {
     return {x: B.x - A.x,    y: B.y - A.y,    z: B.z - A.z}
};

// vectorial product between two vectors
Vector.crossProduct = function(vec1,vec2){
     return {
          x: vec1.y*vec2.z - vec1.z*vec2.y,
          y: vec1.z*vec2.x - vec1.x*vec2.z,
          z: vec1.x*vec2.y - vec1.y*vec2.x
     }
}

// scalar product between two vectors
Vector.dotProduct = function (vec1, vec2){
     return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z
}

// Vector normalization
Vector.Unit = function(v){
     let n = Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
     return {x: v.x/n, y: v.y/n, z: v.z/n}
};

//Vector scale
Vector.scale = function (v, t){
     return {x: v.x*t,  y: v.y*t,  z: v.z*t}
};

//Vector addition
Vector.add = function (vect1, vect2){
     return {
          x: vect1.x + vect2.x,
          y: vect1.y + vect2.y,
          z: vect1.z + vect2.z
     }
}

//Vector 3addition
Vector.add3 = function (vec1, vec2, vec3){
     return {
          x: vec1.x + vec2.x + vec3.x,
          y: vec1.y + vec2.y + vec3.y,
          z: vec1.z + vec2.z + vec3.z
     }
}

//Vector Normal of a plane
Vector.Norm = function (vertexes){
     let vec1 = Vector.fromPoints (vertexes[1], vertexes[0]);
     let vec2 = Vector.fromPoints (vertexes[2], vertexes[0]);
     let p = Vector.crossProduct (vec1, vec2);
     return Vector.Unit(p);
};


function wait(ms)
{
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
}

//Checks if the point is inside the triangle
checkInside = function (object, point){
     var border0 = Vector.fromPoints(object.vertexes[0], object.vertexes[1]);
     var border1 = Vector.fromPoints(object.vertexes[1], object.vertexes[2]);
     var border2 = Vector.fromPoints(object.vertexes[2], object.vertexes[0]);
     var C0 = Vector.fromPoints(object.vertexes[0],point);
     var C1 = Vector.fromPoints(object.vertexes[1],point);
     var C2 = Vector.fromPoints(object.vertexes[2],point);

     if (Vector.dotProduct(object.normal, Vector.crossProduct(border0, C0)) > 0 &&
         Vector.dotProduct(object.normal, Vector.crossProduct(border1, C1)) > 0 &&
         Vector.dotProduct(object.normal, Vector.crossProduct(border2, C2)) > 0)
     {return true};
     return false;
}


//---------------------------------------------------------------------------------------------------------------

var c = document.getElementById("canv");
var scala = 0.5;
var width = 640*scala;
var height = 480*scala;

c.width = width;
c.height = height;
var ctx = c.getContext("2d"),
data = ctx.getImageData(0, 0, width, height);

//var scene = {};

var fake_light_dir = Vector.Unit({x:0.0, y:0.5,z:-1});





// CAMERA
var camera = {
     position: {x:0.0,  y:0.0,  z:0.0},
     target: {x:0.0, y:0.0, z: -1.0},
     fieldOfView : 45,
     UP: {x:0.0, y:1.0, z:0.0},
     rotation: {a: Math.PI/2, b:0.0, c:0.0}
}

var object = {
     name : "triangle",
     position: {x: 0.0, y: 5.0, z: 0.0},
     rotation:    {a: 0.0, b: 0.0, c: 0.0},
     vertexes:[
          {x: -1.0, y: 0.0, z: -0.5},
          {x:  1.0, y: 0.0, z: -0.5},
          {x:  0.0, y:  0.0, z: 1.0}
     ]
};

function recursion(){

     object.rotation.b  = object.rotation.b + Math.PI/128;
     object.rotation.c  = object.rotation.c + Math.PI/128;


     global_camera = {
          position: camera.position,
          target: vertex_globalPos (camera.target, camera.position, camera.rotation),
          UP: vertex_globalPos (camera.UP,Origin, camera.rotation)
     }

     let global_obj = {
          vertexes:
               [
               vertex_globalPos (object.vertexes[0], object.position, object.rotation),
               vertex_globalPos (object.vertexes[1], object.position, object.rotation),
               vertex_globalPos (object.vertexes[2], object.position, object.rotation)
          ]
     }

     global_obj.normal = Vector.Norm (global_obj.vertexes)

     intensity = -Vector.dotProduct(fake_light_dir,global_obj.normal);

     if (intensity<.05){intensity=.05};

     let vec2Point = Vector.fromPoints (global_camera.position,global_obj.vertexes[0])

     let D = Vector.dotProduct(global_obj.vertexes[0], global_obj.normal)

     //ray versors
     var eyeVec  = Vector.Unit(Vector.fromPoints (global_camera.position, global_camera.target));
     var vpRight = Vector.Unit(Vector.crossProduct(eyeVec, global_camera.UP));
     var vpUp    = Vector.Unit(Vector.crossProduct(vpRight, eyeVec));

     fovRadians = (Math.PI * (camera.fieldOfView / 2)) / 180,
     heightWidthRatio = height / width,
     halfWidth = Math.tan(fovRadians),
     halfHeight = heightWidthRatio * halfWidth,
     camerawidth = halfWidth * 2,
     cameraheight = halfHeight * 2,
     pixelWidth = camerawidth / (width - 1),
     pixelHeight = cameraheight / (height - 1);
 
     var ray = {
         point: global_camera.position
     };

     var index;
     for (var x = 0; x < width; x++) {
         for (var y = 0; y < height; y++) {

            var xcomp = Vector.scale(vpRight, x * pixelWidth - halfWidth);
            var ycomp = Vector.scale(vpUp,  halfHeight -y * pixelHeight);

            ray.vector = Vector.Unit(Vector.add3(eyeVec, xcomp, ycomp));

            dist = (Vector.dotProduct (global_obj.normal, global_camera.position)+D)/Vector.dotProduct (global_obj.normal, ray.vector);

            ray.endPoint = Vector.add(ray.point, Vector.scale(ray.vector, dist));

            index = x * 4 + y * width * 4;
            if (checkInside(global_obj, ray.endPoint)==true){
                 data.data[index + 0] = 255*intensity;
                 data.data[index + 1] = 255*intensity;
                 data.data[index + 2] = 255*intensity;
                 data.data[index + 3] = 255;

            } else{
                 data.data[index + 0] = 0;
                 data.data[index + 1] = 0;
                 data.data[index + 2] = 0;
                 data.data[index + 3] = 255;
            }

       }
  }
  ctx.putImageData(data, 0, 0);

}

setInterval(() => {
	recursion();
}, 50);
