




// Rotational Matrix

let Origin = {x:0.0, y:0.0, z:0.0};

let  RED    = [255,   0,   0],
     GREEN  = [  0, 255,   0],
     BLUE   = [  0,   0, 255],
     YELLOW = [255, 255,   0],
     MAGENTA= [255,   0, 255],
     CYAN   = [  0, 255, 255];

color=[RED, RED, GREEN, GREEN, BLUE, BLUE, YELLOW, YELLOW, MAGENTA, MAGENTA, CYAN, CYAN];

console.log(color);

function Rmatrix (r) {
     return [
          [Math.cos(r.c)*Math.cos(r.b),
          Math.cos(r.c)*Math.sin(r.b)*Math.sin(r.a)-Math.sin(r.c)*Math.cos(r.a),
          Math.cos(r.c)*Math.sin(r.b)*Math.cos(r.a)+Math.sin(r.c)*Math.sin(r.a)],
          [Math.sin(r.c)*Math.cos(r.b),
          Math.sin(r.c)*Math.sin(r.b)*Math.sin(r.a)+Math.cos(r.c)*Math.cos(r.a),
          Math.sin(r.c)*Math.sin(r.b)*Math.cos(r.a)-Math.cos(r.c)*Math.sin(r.a)],
          [-Math.sin(r.b),
          Math.cos(r.b)*Math.sin(r.a),
          Math.cos(r.b)*Math.cos(r.a)]
     ]
};

function vertex_globalPos (vertex, position, rotation){
     return {
          x: position.x + vertex.x*Rmatrix(rotation)[0][0] + vertex.y*Rmatrix(rotation)[0][1] + vertex.z*Rmatrix(rotation)[0][2],
          y: position.y + vertex.x*Rmatrix(rotation)[1][0] + vertex.y*Rmatrix(rotation)[1][1] + vertex.z*Rmatrix(rotation)[1][2],
          z: position.z + vertex.x*Rmatrix(rotation)[2][0] + vertex.y*Rmatrix(rotation)[2][1] + vertex.z*Rmatrix(rotation)[2][2]
     }
};

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

Vector.add = function (vect1, vect2){
     return {
          x: vect1.x + vect2.x,
          y: vect1.y + vect2.y,
          z: vect1.z + vect2.z
     }
}

Vector.add3 = function (vec1, vec2, vec3){
     return {
          x: vec1.x + vec2.x + vec3.x,
          y: vec1.y + vec2.y + vec3.y,
          z: vec1.z + vec2.z + vec3.z
     }
}

Vector.Norm = function (verts){
     let vec1 = Vector.fromPoints (verts[1], verts[0]);
     let vec2 = Vector.fromPoints (verts[2], verts[0]);
     let p = Vector.crossProduct (vec1, vec2);
     console.log("normal: ",Vector.Unit(p))
     return Vector.Unit(p);
};

function wait(ms)
{
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
}


checkInside = function (object, point){
     var border0 = Vector.fromPoints(object.verts[0], object.verts[1]);
     var border1 = Vector.fromPoints(object.verts[1], object.verts[2]);
     var border2 = Vector.fromPoints(object.verts[2], object.verts[0]);
     var C0 = Vector.fromPoints(object.verts[0],point);
     var C1 = Vector.fromPoints(object.verts[1],point);
     var C2 = Vector.fromPoints(object.verts[2],point);

     if (Vector.dotProduct(object.normal, Vector.crossProduct(border0, C0)) > 0 &&
         Vector.dotProduct(object.normal, Vector.crossProduct(border1, C1)) > 0 &&
         Vector.dotProduct(object.normal, Vector.crossProduct(border2, C2)) > 0)
     {return true};
     return false;
}


//---------------------------------------------------------------------------------------------------------------

var c = document.getElementById("canv");
var scala = 0.5; //0.00625;
var width = 640*scala;
var height = 480*scala;

c.width = width;
c.height = height;
var ctx = c.getContext("2d");
var data = ctx.getImageData(0, 0, width, height);


//var scene = {};

var fake_light_dir = Vector.Unit({x:0.0, y:0.5,z:-1});





// CAMERA
var camera = {
     position: {x:0.0,  y:0.0,  z:0.0},
     target: {x:0.0, y:0.0, z: -1.0},
     fieldOfView : 60,
     UP: {x:0.0, y:1.0, z:0.0},
     rotation: {a:Math.PI/2, b:0.0, c:0.0}
}

/*
var solid = {
     name : "tetrahedron",
     position: {x: 0.0, y: 5.0, z: 0.0},
     rotation: {a:0.0, b:0.0, c: 0.0},
     connections: [
          [0,1,3],
          [1,2,3],
          [2,0,3],
          [0,2,1]
     ],
     verts: [
          {x:  0.0, y: -0.577, z: -0.288},
          {x:  0.5, y:  0.289, z: -0.288},
          {x: -0.5, y:  0.289, z: -0.288},
          {x:  0.0, y:  0.0, z: 0.528}
     ]
};
*/

var solid = {
     name : "cube",
     position: {x: 0.0, y: 5.0, z: 0.0},
     rotation: {a:0.0, b:Math.PI/4, c: Math.PI/4},
     connections: [
          [0,1,5],
          [0,5,4],
          [1,2,6],
          [1,6,5],
          [2,3,7],
          [2,7,6],
          [3,0,4],
          [3,4,7],
          [0,2,1],
          [0,3,2],
          [4,6,7],
          [4,5,6]
     ],
     verts: [
          {x:  1.0, y: -1.0, z: -1.0},   //0
          {x:  1.0, y:  1.0, z: -1.0},   //1
          {x: -1.0, y:  1.0, z: -1.0},   //2
          {x: -1.0, y: -1.0, z: -1.0},   //3
          {x:  1.0, y: -1.0, z:  1.0},   //4
          {x:  1.0, y:  1.0, z:  1.0},   //5
          {x: -1.0, y:  1.0, z:  1.0},   //6
          {x: -1.0, y: -1.0, z:  1.0}    //7
     ]

};





function recursion(){

     solid.rotation.c  = solid.rotation.c + Math.PI/128;
     solid.rotation.b  = solid.rotation.b + Math.PI/128;


     global_camera = {
          position: camera.position,
          target: vertex_globalPos (camera.target, camera.position, camera.rotation),
          UP: vertex_globalPos (camera.UP, Origin, camera.rotation)
     }

     //console.log ("position: ", global_camera.position);
     //console.log ("target: ",   global_camera.target);
     //console.log ("UP: ",       global_camera.UP);

     var n_faces = solid.connections.length;

     console.log ("faces: ",n_faces);
     //object.rotation.c = object.rotation.c + Math.PI/128;

     var global_solid    = {};
     global_solid.verts  = [];
     global_solid.normal = [];

     // builds global solid vertices
     for (let i=0; i< solid.verts.length; i++){
          //console.log("verts test",solid.verts[i])
          global_solid.verts.push(vertex_globalPos (solid.verts[i], solid.position, solid.rotation));
     }
     //console.log("global solid verts", global_solid.verts);

     // finds faces normals
     for (let i=0; i< n_faces; i++){
          global_solid.normal.push (Vector.Norm ([
               global_solid.verts[solid.connections[i][0]],
               global_solid.verts[solid.connections[i][1]],
               global_solid.verts[solid.connections[i][2]]
          ]));

//          console.log(solid.connections[i][0]+" "+
//               solid.connections[i][1]+" "+
//               solid.connections[i][2]+" "
//          )
     };

     // camera versors
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
     console.log("--------------------------------------------------------------------------------------------------------");
     for (var x = 0; x < width; x++) {
          for (var y = 0; y < height; y++) {

               index = x * 4 + y * width * 4;

               data.data[index + 0] = 0;
               data.data[index + 1] = 0;
               data.data[index + 2] = 0;
               data.data[index + 3] = 255;

               for (let face=0; face<n_faces; face++){



               // tetrahedron's triangle to analize
               var triangle = {}
               triangle.verts = [global_solid.verts[solid.connections[face][0]],
                                 global_solid.verts[solid.connections[face][1]],
                                 global_solid.verts[solid.connections[face][2]]
               ];
                                             //console.log("temp_triangle",triangle.verts);
               triangle.normal = global_solid.normal[face];
                                             //console.log("triangle_norm", triangle.normal)
               //console.log("TRIANGLE VERTS "+face+ " 0" , triangle.verts[solid.connections[face][0]])
               //console.log("TRIANGLE CONNECTIONS "+face+ " 0" , solid.connections[face][0])
               var D = Vector.dotProduct(triangle.verts[0], triangle.normal)
                                             //console.log ("D"+face+": "+D);
               if (D>=0){
                                             //console.log("la faccia "+face+" non è in vista");
                    continue};

               var xcomp = Vector.scale(vpRight, x * pixelWidth - halfWidth);
               var ycomp = Vector.scale(vpUp,  halfHeight -y * pixelHeight);
               ray.vector = Vector.Unit(Vector.add3(eyeVec, xcomp, ycomp));
               var dist = (Vector.dotProduct (triangle.normal, global_camera.position)+D)/Vector.dotProduct (triangle.normal, ray.vector);
                                             //console.log("dist"+face+" : "+dist);
               ray.endPoint = Vector.add(ray.point, Vector.scale(ray.vector, dist));
                                             //console.log("HITPOINT: ",ray.endPoint)


               var HIT = checkInside(triangle, ray.endPoint);
                                             //console.log("HIT? "+face+" "+HIT)
               if (HIT==true){
                    data.data[index + 0] = color[face][0];
                    data.data[index + 1] = color[face][1];
                    data.data[index + 2] = color[face][2];
                    data.data[index + 3] = 255;
               }
          }
     }
 }

  ctx.putImageData(data, 0, 0);
}
setInterval(() => {
  	recursion();
}, 50);
