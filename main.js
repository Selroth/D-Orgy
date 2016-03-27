"use strict";

var page = {
	canvas: null,
	dPanel: null,
	game: {
		timeLine: []
	}
};

var currentRealTime = 0;
var lastRealTime = 0;
var deltaRealTime = 0;
var currentGameTime = 0;
var dt = 0; //Delta Game Time

//Returns an array filled with count items of the specified value.
function filledArray(count, value) {
	var array = [];
	for (var i=0; i<count; i++) {
		array[i] = value;
	}
	return array;
}

//These arrays are used for graphing the framerate.
var dtHistory = filledArray(50, 0);
var dRTHistory = filledArray(50, 0);

//HTML Buttons and Stuff
var paused = false;
var cleanBlit = true;
function togglePause(){ paused = !paused; }
function toggleCleanBlit(){ cleanBlit = !cleanBlit; }

function event(time, func, para, desc, timeDependant){
	if ( !(this instanceof event) ) throw new Error("Constructor called as a function");
	this.time = time;
	this.func = func;
	this.para = para;
	this.desc = desc;
	this.timeDependant = timeDependant;
	this.timeSpent = 0;
	this.result = undefined;
}

function checkTimeLine(pTime){
	//make sure it's an event we're looking at, else purge it till we arrive to an event or exhause the timeline
	while( !(page.game.timeLine[0] instanceof event) && page.game.timeLine.length > 0){
		var junk = page.game.timeLine.shift();
		debugger;
	}
	if (page.game.timeLine.length > 0){
		if (pTime >= page.game.timeLine[0].time) {
			return true;
		}
	}
	return false;
}

function nextFrame(){
	//What time is it, and how much time has passed?
	lastRealTime = currentRealTime;
	currentRealTime = new Date().getTime();
	deltaRealTime = currentRealTime - lastRealTime;

	if (deltaRealTime > 1000 || paused){ //If over a second has passed, assume the game has been paused.
		dt = 0;
	}else{
		//Have we arrived at any timeline events?  If so, increment time to exactly the trigger time of the next event.
		if(checkTimeLine(currentGameTime + deltaRealTime)){ dt = page.game.timeLine[0].time - currentGameTime;
			}else{ 											dt = deltaRealTime; }

		currentGameTime += dt;
	}

	//Update our graphs.
	dtHistory.unshift(dt);
	dtHistory.pop();
	dRTHistory.unshift(deltaRealTime);
	dRTHistory.pop();

	//Execute any events
	while(checkTimeLine(currentGameTime)){
		var currentEvent = page.game.timeLine.shift();
		currentEvent.func(currentEvent.para);
	}

	page.game.ball.tick(dt);
	update();
	draw();
	requestAnimationFrame(nextFrame);
}

//This function is called by the event handler when the event is a collision.  It handles the collision and detects/enqueues the next collision in the system.
function collision(hitObject){

	//Have the collision take effect on the ball.
	if (hitObject != undefined){
		var x = page.game.ball.getXVel();
		var y = page.game.ball.getYVel();

		//Only the ball and the walls are colliable objects for the time being.
		if (hitObject == "left wall" || hitObject == "right wall") x = page.game.ball.getXVel() * -1;
		if (hitObject == "top wall" || hitObject == "bottom wall") y = page.game.ball.getYVel() * -1;
		page.game.ball.setVel(x, y);
	}

	//find the next collision, if we're moving.
	if (page.game.ball.getXVel() != 0 || page.game.ball.getYVel() != 0){
		var dx = (page.game.ball.getXVel() < 0) ? page.game.ball.getXPos() : 600 - page.game.ball.getXPos();
		var dxWall = (page.game.ball.getXVel() < 0) ? "left wall" : "right wall";
		var dy = (page.game.ball.getYVel() < 0) ? page.game.ball.getYPos() : 400 - page.game.ball.getYPos();
		var dyWall = (page.game.ball.getYVel() < 0) ? "top wall" : "bottom wall";
		var tx = Math.round(dx/Math.abs(page.game.ball.getXVel()));
		var ty = Math.round(dy/Math.abs(page.game.ball.getYVel()));
		var t = (tx < ty) ? tx : ty;
		var hitWall = (tx < ty) ? dxWall : dyWall;

		if (t > 0){
			var nextCollision = new event(t + currentGameTime, collision, hitWall, "collision", false);
			page.game.timeLine.push(nextCollision);
			page.game.timeLine.sort(function (a, b){ return a.time - b.time; });
		}
	}
}

function update(){

	var m = 0.003;
	var a = Math.atan2(page.game.ball.getYPos() - page.game.dragon.getYPos(), page.game.ball.getXPos() - page.game.dragon.getXPos());

	var x = m*Math.cos(a);
	var y = m*Math.sin(a);
	page.game.dragon.setAcc(x, y);

	page.game.dragon.tick(dt);

}

function draw(){

	var ctx = page.canvas.getContext("2d");
	var dctx = page.dPanel.getContext("2d");

	//Start with a clean plate
	if (cleanBlit){
		ctx.clearRect(0, 0, page.canvas.width, page.canvas.height);
	}
	dctx.clearRect(0, 0, page.dPanel.width, page.dPanel.height);

	//Draw the FPS chart
	dctx.beginPath();
	dctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
	dctx.moveTo(10, 10);
	var j = 0;
	for (var i=0; i<dRTHistory.length; i++){
		dctx.moveTo(10+i, 50);
		dctx.lineTo(10+i, 50-(1000/dRTHistory[i])/2);
		j += dRTHistory[i];
	}
	dctx.stroke();
	dctx.fillText(Math.round(1000/(j/dRTHistory.length)) + "FPS", 20, 40);

	//Draw gametime chart
	dctx.beginPath();
	dctx.strokeStyle = "rgba(128, 0, 128, 0.8)";
	dctx.moveTo(10, 60);
	j = 0;
	for (var i=0; i<dtHistory.length; i++){
		dctx.moveTo(10+i, 100);
		dctx.lineTo(10+i, 100-dtHistory[i]/2);
		j += dtHistory[i];
	}
	dctx.stroke();
	dctx.fillText(Math.round(j/dtHistory.length) + "dt", 20, 90);

	//Draw timeline
	dctx.beginPath(); //Current Time Marker
	dctx.strokeStyle = "rgba(0, 128, 128, 0.8)";
	dctx.moveTo(2, 110);
	dctx.lineTo(50, 110);
	dctx.stroke();
	dctx.fillText(currentGameTime + "ms", 70, 110);

	dctx.beginPath(); //Second ticks
	dctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
	dctx.moveTo(10, 110);
	dctx.lineTo(10, 410);
	for (var i=0; i<29; i++){
		var y = 120 + (10 * i) - (currentGameTime % 1000)/100;
		dctx.moveTo(5, y);
		dctx.lineTo(15, y);
	}
	dctx.stroke();

	dctx.beginPath(); //Event ticks
	dctx.strokeStyle = "rgba(0, 0, 255, 0.8)";
	for (var i=0; i<page.game.timeLine.length; i++){
		y = 110 + (page.game.timeLine[i].time-currentGameTime)/100;
		dctx.moveTo(2, y);
		dctx.lineTo(25, y);
		dctx.fillStyle = "rgba(0, 0, 0, 0.2)";
		dctx.fillText(page.game.timeLine[i].desc + ": " + page.game.timeLine[i].para, 25, y);
	}
	dctx.stroke();

	//Draw ball
	ctx.beginPath();
	ctx.arc(page.game.ball.getXPos(), page.game.ball.getYPos(), page.game.ball.radius, 0, Math.PI*2, true);
	ctx.fillStyle = "rgba(0, 128, 175, 0.8)";
	ctx.fill();

	//Draw dragon
	ctx.beginPath();
	ctx.arc(page.game.dragon.getXPos(), page.game.dragon.getYPos(), page.game.dragon.radius, 0, Math.PI*2, true);
	ctx.fillStyle = "rgba(0, 0, 175, 0.8)";
	ctx.fill();

	//draw grid
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
	for(var x = 0; x < 600; x = x + 10){
		ctx.moveTo(x, 0);
		ctx.lineTo(x, 400);
	}
	for(var y = 10; y < 400; y = y + 10){
		ctx.moveTo(0, y);
		ctx.lineTo(600, y);
	}
	ctx.stroke();
}

// This is the initialization function
(function() {
	window.onload = function(){
		//debugger;
		page.canvas = document.getElementById("canvas");
		page.dPanel = document.getElementById("dPanel");

		window.requestAnimationFrame = (function(){
			//Check for each browser
			//@paul_irish function
			//Globalises this function to work on any browser as each browser has a different namespace for this
			return  window.requestAnimationFrame       ||  //Chromium
					window.webkitRequestAnimationFrame ||  //Webkit
					window.mozRequestAnimationFrame    || //Mozilla Geko
					window.oRequestAnimationFrame      || //Opera Presto
					window.msRequestAnimationFrame     || //IE Trident?
					function(callback, element){ //Fallback function
						window.setTimeout(callback, 1000/60);
					};
		})();

		//Game objects
		var game = page.game;
		game.ball = new window.Particle(10, 10, 1.0);
		game.ball.setPos(100, 50);
		game.ball.setVel(0.1, 0.1);
		game.dragon = new window.Particle(20, 20, 0.999);
		game.dragon.setPos(300, 100);

		//Build some events so something actually happens in the "event-based" game.
		var myEvent = new event(1000, collision, "", "initialize collisions", false);
		var myEvent2 = new event(20000, function(){game.ball.setPos(250, 250);}, "How you like this?", "teleport", false);
		var myEvent3 = new event(30000, function(){game.ball.setPos(300, 200); collision();}, "Haha, gotcha!", "teleport again", false);
		var myEvent4 = new event(180000, function(){game.ball.setPos(50, 50);}, "", "You must be REALLY bored...", false);
		var myEvent5 = new event(3600000, function(){game.ball.setPos(300,200);}, "", "LOL, seriously?!  No more.", false);

		//Add the events to the timeline
		game.timeLine.push(myEvent);
		game.timeLine.push(myEvent2);
		game.timeLine.push(myEvent3);
		game.timeLine.push(myEvent4);
		game.timeLine.push(myEvent5);

		//That's enough foreplay - let's get this show on the road!  First frame, here we come...
		nextFrame();
	};
})();
