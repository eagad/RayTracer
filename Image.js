var BLACK=vec4(0.0, 0.0, 0.0, 1.0);
var WHITE=vec4(1.0, 1.0, 1.0, 1.0);
var RED=vec4(1.0, 0.0, 0.0, 1.0);
var GREEN=vec4(0.0, 1.0, 0.0, 1.0);
var BLUE=vec4(0.0, 0.0, 1.0, 1.0);
var CYAN=vec4(0.0, 1.0, 1.0, 1.0);
var YELLOW=vec4(1.0, 1.0, 0.0, 1.0);
var PURPLE=vec4(1.0, 0.0, 1.0, 1.0);


var Image=function(canvas){
    this.canvas=canvas
    this.width=canvas.width;
    this.height=canvas.height;
}

    Image.prototype.setPixel = function(x, y, color)
{
    if (x<0 || y<0 || x>=this.canvas.width || y>=this.canvas.height)
	{
	    return;
	}
    
    pixels[y*this.canvas.width+x]=color;
}
	
	
	Image.prototype.getPixel = function(x, y)
{
    if (x>=0 && x<this.canvas.width && y>=0 && y<this.canvas.height)
	{
	    var index=x+(this.canvas.width*y);
	    
	    return(pixels[index]);
	}
    else
	{
	    return vec4(0, 0, 0, 1);
	}
    
}
    
    Image.prototype.clearImage = function()
{
    for (var i=0; i<this.canvas.width*this.canvas.height; i++)
	pixels.push(vec4(0, 0, 0, 1));
}
	
	Image.prototype.setImageSize = function(width, height)
{
    this.canvas.width=width;
    this.canvas.height=height;
    this.width=width;
    this.height=height;
}
