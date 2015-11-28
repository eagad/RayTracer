var gl;
var myImage;
var program;
var pixels=[];
var points=[];
var colors=[];

var objects=[];

var lightPosition=vec3(0,100,0);
var eyePosition=vec3(0,0,-50);
var lookPoint=vec3(0,0,0);

var kd=0.9; //diffuse
var ka=0.1; //ambient

function trace_ray(origin,direction){
	var nearest_t=Infinity;
	var nearest_object=null;

	//find closest intersection point
	for (i=0;i<objects.length;i++){
		var object=objects[i];
		var t=null;
		//assuming each object is spherical
			var center=object.center; //center of circle
			var r=object.radius; //radius of circle

			var dist=vec_subtract(origin,center);

			var a=dot(direction,dist);
			var b=a*a-magnitude(dist)^2+r*r;
			//b>0, two solutions exist
			//b=0, one solution exists
			//b<0, no solutions exist	
			if (b>0){
				t=Math.min(-a+Math.sqrt(b),-a-Math.sqrt(b));
			}
		if (t != null){
			if (t<nearest_t){
				nearest_t=t;
				nearest_object=object;
			}
		}
	}

	var color=BLACK;
	if (nearest_object != null){
		
		var intersect_point=vec_mult(direction,nearest_t); //point of intersection

		if (nearest_object.reflect_coeff>0){
			var reflection_vector=vec3();
			var reflect_color=trace_ray(intersect_point,reflection_vector);
			color+=nearest_object.reflect_coeff*reflected_color;
		}
		if (nearest_object.refract_coeff>0){
			var refraction_vector=vec3();
			var refract_color=trace_ray(intersect_point,refraction_vector);
			color+=nearest_object.refract_coeff*refracted_color;
		}
		if (shadow_ray(intersect_point,lightPosition)){
			//no shadow
			var L=unit(vec_subtract(lightPosition,intersect_point));
			var N=unit(vec_subtract(intersect_point,nearest_object.center));

			var factor=dot(N,L);	
	
			var c=nearest_object.color;
	
			color=vec4(c[0]*factor*kd+c[0]*ka,c[1]*factor*kd+c[1]*ka,c[2]*factor*kd+c[2]*ka,1.0);		
		}
	}
	return color;			
		
}

function shadow_ray(origin,light){
	var nearest_t=Infinity;
	var nearest_object=null;

	var direction = unit(vec_subtract(light,origin));

	for (i=0;i<objects.length-1;i++){
		var object=objects[i];
		var t=null;
		//assuming each object is spherical
			var center=object.center; //center of circle
			var r=object.radius; //radius of circle

			var dist=vec_subtract(origin,center);

			var a=dot(direction,dist)
			var b=a*a-magnitude(dist)^2+r*r;
			//b>0, two solutions exist
			//b=0, one solution exists
			//b<0, no solutions exist	
			if (b>0){
				t=Math.min(-a+Math.sqrt(b),-a-Math.sqrt(b));
			}
		if (t != null){
			if (t<nearest_t){
				nearest_t=t;
				nearest_object=object;
			}
		}
	}
	return t==null;
}

function dot(vec1,vec2){
	return (vec1[0]*vec2[0]+vec1[1]*vec2[1]+vec1[2]*vec2[2]);
}

function vec_negate(vec){
	return vec3(-vec[0],-vec[1],-vec[2]);
}

function vec_mult(vec,scalar){
	return vec3(vec[0]*scalar,vec[1]*scalar,vec[2]*scalar);
}

function vec_add(vec1,vec2){
	return vec3(vec1[0]+vec2[0],vec1[1]+vec2[1],vec1[2]+vec2[2]);
}

function vec_subtract(vec1,vec2){
	return vec3(vec1[0]-vec2[0],vec1[1]-vec2[1],vec1[2]-vec2[2]);
}

function magnitude(vector){
	return Math.sqrt(vector[0]^2+vector[1]^2+vector[2]^2);
}
function unit(vector){
	var magnitude=Math.sqrt(vector[0]^2+vector[1]^2+vector[2]^2);
	return vec3(vector[0]/magnitude,vector[1]/magnitude,vector[2]/magnitude);
}

function generateImage()
{
	var sphere1=new Sphere(vec3(0,0,50),50);

	objects.push(sphere1);

	for (x=1; x<myImage.width; x++){
		for (y=1; y<myImage.height; y++){
			var direction=vec3(x-eyePosition[0],y-eyePosition[1],-eyePosition[2]);
			myImage.setPixel(x,y,trace_ray(eyePosition,unit(direction)));
		}
	}
	renderImage(myImage);
}

function glInit(canvas)	    
{
    //makes our GL instance
    gl=WebGLUtils.setupWebGL(canvas);
    //gets and initializes our vertex and fragment shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    //sets the resulting shader program to use
    gl.useProgram(program);
}

window.onload=function init()
{
    //In your HTML file there is a "canvas" object.
    //This is where our graphic are drawn (like a painter's canvas)
    //This line of code grabs the canvas object, so we can use it to
    //draw our graphics!
    var canvas = document.getElementById("gl-canvas");

    //This function initializes all our WebGL parameters
    //We'll get more into this as the semester progresses
    //For the time being, its MAGIC.
    glInit(canvas);

    //Here we make a new Image instance.  This is a 2D image object
    //that has been made specifically for you to use in learning
    //graphics.
    myImage=new Image(canvas);

    //Here we are specifying the width and height of our new Image.
    myImage.setImageSize(512, 256);
    //Now are are initializing out image to make sure all the pixels
    //are empty.
    myImage.clearImage();

    //This is the function that you need to edit in order to draw
    //your image.  See it above.
    generateImage(myImage);

    //This function draws your image to the screen
    renderImage(myImage);   
}

function renderImage(myImage)
{
    points=[]; //holds screen points, in this case the pixel coordinates
    colors=[]; //holds the colors of each point
    
    //This loop converts the pixel locations to
    //GL canvas coordinates.  These are not the same thing
    //in this particular case.  We will talk more about this
    //in the class.
    for (var i=0; i<pixels.length; i++)
	{
	    var y=Math.floor(i/myImage.width);
	    var x=i-(y*myImage.width);
	    
	    colors.push(myImage.getPixel(x, y));

	    x/=myImage.width/2;
	    y/=myImage.height/2;

	    x-=1.0;
	    y-=1.0;

	    points.push(vec3(x, y, 0.0));
	}

    //sets the WebGL clear color and viewport size
    gl.clearColor(0.7, 0.7, 0.7, 1.0);
    gl.viewport(0, 0, myImage.width, myImage.height);

    //creates a GL buffer on the GPU to hold our points
    var posBufferID=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBufferID);
    //here we send our points to the GPU
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    //Associates the points we just sent with a particular attribute 
    //in the vertex shader program
    program.vPositionA=gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(program.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionA);

    //---------------------------------

    //creates a GL buffer on the GPU to hold our colors
    //these must be in the same order as their respective points
    //in the previous step
    var colBufferID=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBufferID);
    //here we are sending our colors to the GPU
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    //Associates the colors we just sent with a particular attribute
    //in the vertex shader program
    program.vColorA=gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(program.vColorA, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vColorA);
    
    //calls the function that does the GL magic that renders our
    //points and colors
    render(program, colBufferID, posBufferID);
}

function render(program, colBufferID, posBufferID)    
{
    //Clears the draw buffer before writing to it again
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, colBufferID);
    gl.vertexAttribPointer(program.vColorA, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBufferID);
    gl.vertexAttribPointer(program.vPositionA, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, points.length);
}
