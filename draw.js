var gl;
var Image;
var program;
var pixels=[];
var points=[];
var colors=[];

function trace_ray(ray){
	var point_color, reflect_color, refract_color;

	var obj=get_first_intersection(ray);
	point_color=get_point_color(obj);

	//if (object is reflective)
	//	reflect_color=trace_ray(get_reflected_ray(ray,obj));
	//if (object is refractive)
	//	refract_color=trace_ray(get_refracted_ray(ray,obj));
	
	return combine_colors(point_color,reflect_color,refract_color);
}

function combine_colors(point_color,reflect_color,refrace_color){
	return NULL;
}

function get_first_intersection(ray){
  return NULL;
}

function get_first_intersection(ray){
	return NULL;
}

function generateImage(){
	for (x=1; x<Image.width; x++){
		for (y=1; y<Image.height; y++){
			//Fire ray from the eye through the pixel
			//Trace the ray and set the pixel's color
			var origin_ray;
			Image.setPixel(x,y,trace_ray(origin_ray));
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
