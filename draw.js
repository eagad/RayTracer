var gl;
var myImage;
var program;
var pixels=[];
var points=[];
var colors=[];

var objects=[];

var lightPosition=vec3(256,1000,0);
var eyePosition=vec3(256,128,-500);
var lookPoint=vec3(0,0,0);

var max_depth=10;

var kd=0.9; //diffuse
var ka=0.2; //ambient

function sphere_intersect(s,d,sphere){
	var r=sphere.radius;
	var c=sphere.center;

	var rsq=r*r;

	var p=vec_subtract(c,s);
	var p_d=dot(p,d);
	if (p_d<0 || (dot(p,p) < rsq))
		return null;
	var a=vec_subtract(p,vec_mult(d,p_d));
	var asq=dot(a,a);
	if (asq>rsq)
		return null;
	var h=Math.sqrt(rsq-asq);	

	var i=vec_subtract(a,vec_mult(d,h));
	var intersect=vec_subtract(c,i);
	var normal=unit(vec_mult(i,-1/r));

	return [intersect,normal];
}

function trace_ray(origin,direction,depth){
	var nearest_t=Infinity;
	var nearest_object=null;
	var surface_normal=null;
	var intersect_point=null;

	//find closest intersection point
	for (i=0;i<objects.length;i++){
		var object=objects[i];

		var intersection=sphere_intersect(origin,direction,object);
		if (intersection != null){
			var intersect=intersection[0];
			var normal=intersection[1];
			var t=magnitude(vec_subtract(intersect,origin));
			if (t<nearest_t){
				nearest_t=t;
				nearest_object=object;
				intersect_point=intersect;
				surface_normal=normal;
			}
		}
	}

	var color=BLACK;
	var reflect_color=BLACK;
	if (nearest_object != null){

		if (depth<max_depth){
		if (nearest_object.reflect_coeff>0){
			var d=vec_negate(direction);
			var n=surface_normal;
			var reflection_vector=vec_add(d,vec_mult(n,-2*dot(d,n)));
			
			var c=nearest_object.reflect_coeff;
			rc=trace_ray(intersect_point,reflection_vector,depth+1);
			reflect_color=vec4(rc[0]*c,rc[1]*c,rc[2]*c,1.0);
		}
		if (nearest_object.refract_coeff>0){
		}
		}
		var L=unit(vec_subtract(lightPosition,intersect_point));
		var N=surface_normal;

		var factor=dot(N,L);	

		var c=nearest_object.color;
		var hit=findShadows(vec_add(intersect_point,surface_normal));
		if (hit!=null){
			color=vec4(c[0]*0.03,c[1]*0.03,c[2]*0.03,1.0);
		}else{
			color=vec4(c[0]*factor*kd+c[0]*ka,c[1]*factor*kd+c[1]*ka,c[2]*factor*kd+c[2]*ka,1.0);		
		}
		color=vec4(color[0]+reflect_color[0],color[1]+reflect_color[1],color[2]+reflect_color[2]);
	}
	return color;			
		
}

function findShadows(origin){
	var direction=unit(vec_subtract(lightPosition,origin));
	for (i=0;i<objects.length;i++){
		var object=objects[i];

		var intersection=sphere_intersect(origin,direction,object);
		if (intersection != null){
			return object;
		}
	}
	return null;
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

function magnitude(vec){
	return Math.sqrt(vec[0]*vec[0]+vec[1]*vec[1]+vec[2]*vec[2]);
}
function unit(vec){
	var mag=magnitude(vec);
	return vec3(vec[0]/mag,vec[1]/mag,vec[2]/mag);
}

function generateImage()
{
	var sphere1=new Sphere(vec3(100,100,100),100);
	sphere1.setColor(RED);
	sphere1.setReflectionCoefficient(0.5);

	var sphere2=new Sphere(vec3(200,250,100),75);
	sphere2.setColor(GREEN);
	sphere2.setReflectionCoefficient(0.5);

	var sphere3=new Sphere(vec3(500,150,100),50);
	sphere3.setColor(BLUE);
	sphere3.setReflectionCoefficient(0.5);

	var sphere4=new Sphere(vec3(300,200,250),50);
	sphere4.setColor(PURPLE);
	sphere4.setReflectionCoefficient(0.5);

	objects.push(sphere1);
	objects.push(sphere2);
	objects.push(sphere3);
	objects.push(sphere4);

/*	for (i=1;i<5;i++){
		var sphere=new Sphere(vec3(Math.random()*512,Math.random()*256,Math.random()*200+100),Math.random()*50+25);
		sphere.setColor(vec4(Math.random(),Math.random(),Math.random(),1.0));
		objects.push(sphere);
	}
*/

	for (x=1; x<myImage.width; x++){
		for (y=1; y<myImage.height; y++){
			var pixelPos=vec3(x,y,0);
			var direction=vec_subtract(pixelPos,eyePosition);
			myImage.setPixel(x,y,trace_ray(eyePosition,unit(direction),0));
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
