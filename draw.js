var gl;
var Image;
var program;
var pixels=[];
var points=[];
var colors=[];

var objects=[]

var lightPosition=vec3(0,100,0);
var eyePosition=vec3(0,0,-50);
var lookPoint=vec3(0,0,0);

function trace_ray(origin,direction){
	var nearest_t=Infinity;
	var nearest_object=null;
	for each (var object in objects){
		//find t, the smallest non-negative real solution to the ray/object
		//intersection equation
		if (t != null){
			if t<nearest_t{
				nearest_t=t;
				nearest_object=object;
			}
		}
	}
	var color=vec4(0.0,0.0,0.0,1.0);
	if (nearest_object != null){
		var intersect_point=vec3();
		var normal=vec3();
		if (/*object is reflective*/){
			var reflection_vector=vec3();
			var reflect_color=trace_ray(intersect_point,reflection_vector);
			color+=reflection_coeff*reflected_color;
		}
		if (/*object is refractive*/){
			var refraction_vector=vec3();
			var refract_color=trace_ray(intersect_point,refraction_vector);
			color+=refraction_coeff*refracted_color;
		}
		if shadow_ray(intersec_point,lightPosition){
			//no shadow
			//calculate light's color contribution by doing the illlumination calculations using D,N, the current light, and the object properties
			color+=//light's color contribution
		}
	}
	return color;			
		
}

function shadow_ray(point1,point2){
	var nearest_t=Infinity;
	var nearest_object=null;
	for each (var object in objects){
		//find t, the smallest non-negative real solution to the ray/object
		//intersection equation
		if (t!=null){
			if (t<nearest_t){
				nearest_t=t;
			}
		}
	}
	if (t<1)
		return false;
	else
		return true;
}

function generateImage(){
	for (x=1; x<Image.width; x++){
		for (y=1; y<Image.height; y++){
			var direction=vec3(x-eyePosition[0],y-eyePosition[1]-y,-eyePosition.z);
			var magnitude=Math.sqrt(direction[0]^2+direction[1]^2+direction[2]^2);
			direction=vec3(direction[0]/magnitude,direction[1]/magnitude,direction[2]/magnitude);
			Image.setPixel(x,y,trace_ray(eyePosition,direction));
		}
	}
	renderImage(Image);
}

function clearImage(){
	for (x=1; x<Image.width; x++){
		for (y=1; y<Image.height; y++){
			Image.setPixel(x,y,WHITE);
		}
	}
	renderImage(Image);
}

function glInit(canvas)	    
{
    gl=WebGLUtils.setupWebGL(canvas);
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
}

window.onload=function init()
{
    var canvas = document.getElementById("gl-canvas");

    glInit(canvas);

    Image=new Image(canvas);

    Image.setImageSize(512, 256);
    Image.clearImage();

    clearImage();
}

function renderImage(Image)
{
    points=[];
    colors=[];
    
    for (var i=0; i<pixels.length; i++)
	{
	    var y=Math.floor(i/Image.width);
	    var x=i-(y*Image.width);
	    
	    colors.push(Image.getPixel(x, y));

	    x/=Image.width/2;
	    y/=Image.height/2;

	    x-=1.0;
	    y-=1.0;

	    points.push(vec3(x, y, 0.0));
	}

    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.viewport(0, 0, Image.width, Image.height);

    var posBufferID=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBufferID);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    program.vPositionA=gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(program.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionA);

    var colBufferID=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBufferID);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    program.vColorA=gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(program.vColorA, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vColorA);
    
    render(program, colBufferID, posBufferID);
}

function render(program, colBufferID, posBufferID)    
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, colBufferID);
    gl.vertexAttribPointer(program.vColorA, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBufferID);
    gl.vertexAttribPointer(program.vPositionA, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, points.length);
}
