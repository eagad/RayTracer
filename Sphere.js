var Sphere=function(center,radius){
	this.center=center;
	this.radius=radius;
	this.reflect_coeff=0;
	this.refract_coeff=0;
	this.color=WHITE;
}

Sphere.prototype.setColor=function(c){
	this.color=c;
}
Sphere.prototype.setReflectionCoefficient=function(r){
	this.reflect_coeff=r;
}

Sphere.prototype.setRefractionCoefficient=function(r){
	this.refract_coeff=r;
}
