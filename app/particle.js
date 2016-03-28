"use strict";
define({
	// Particle class
	Particle: function(mass, radius, dampingFactor) {
		this.mass = mass;
		this.radius = radius;
		this.damping = dampingFactor || 1.0;
		var xPos = 0;
		var yPos = 0;
		var xVel = 0;
		var yVel = 0;
		var xAcc = 0;
		var yAcc = 0;
		this.setPos = function (x, y) {xPos = x; yPos = y;};
		this.getXPos = function () {return xPos;};
		this.getYPos = function () {return yPos;};
		this.setVel = function (x, y) {xVel = x; yVel = y;};
		this.getXVel = function () {return xVel;};
		this.getYVel = function () {return yVel;};
		this.setAcc = function (x, y) {xAcc = x; yAcc = y;};
		this.tick = function (dt){
			xVel += xAcc * dt;
			yVel += yAcc * dt;
			xVel *= this.damping;
			yVel *= this.damping;
			xPos += xVel * dt;
			yPos += yVel * dt;
		};
	},
});
