var cvs;
var ctx;

var timeLine = [];
var currentRealTime = 0;
var lastRealTime = 0;
var deltaRealTime = 0;
var currentGameTime = 0;
var dt = 0; //Delta Game Time

//User Interface
var dtHistory = [];
for (i=0; i<50; i++){
	dtHistory.unshift(0);
}

var dRTHistory = [];
for (i=0; i<50; i++){
	dRTHistory.unshift(0);
}

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

function particle(mass, radius){
	if ( !(this instanceof particle) ) throw new Error("Constructor called as a function");
	this.mass = mass;
	this.radius = radius;	
	var xPos = 0;
	var yPos = 0;
	var xVel = 0;
	var yVel = 0;
	var xAcc = 0;
	var yAcc = 0;
	this.setPos = function (x, y) {xPos = x; yPos = y;}
	this.getXPos = function () {return xPos;}
	this.getYPos = function () {return yPos;}
	this.setVel = function (x, y) {xVel = x; yVel = y;}
	this.getXVel = function () {return xVel;}
	this.getYVel = function () {return yVel;}
	this.setAcc = function (x, y) {xAcc = x; yAcc = y;}
	this.tick = function (dt){
		xVel += xAcc * dt;
		yVel += yAcc * dt;
		xPos += xVel * dt;
		yPos += yVel * dt;
	}
}
function checkTimeLine(pTime){
	//make sure it's an event we're looking at, else purge it till we arrive to an event or exhause the timeline
	while( !(timeLine[0] instanceof event) && timeLine.length > 0){			
		var junk = timeLine.shift();
		debugger;
	}
	if (timeLine.length > 0){
		if (pTime >= timeLine[0].time) {	
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
		//Have we arrived at any timeline events?
		if(checkTimeLine(currentGameTime + deltaRealTime)){ dt = timeLine[0].time - currentGameTime;
			}else{ 											dt = deltaRealTime; }
		
		currentGameTime += dt;
	}
	dtHistory.unshift(dt);
	dtHistory.pop();
	dRTHistory.unshift(deltaRealTime);
	dRTHistory.pop();

	while(checkTimeLine(currentGameTime)){
		var currentEvent = timeLine.shift();
		currentEvent.func(currentEvent.para);
	}
	
	ball.tick(dt);
	update();
	draw();
	requestAnimationFrame(nextFrame);
}


function collision(hitObject){
	if (hitObject != undefined){
		x = ball.getXVel();
		y = ball.getYVel();
		if (hitObject == "left wall" || hitObject == "right wall") x = ball.getXVel() * -1;
		if (hitObject == "top wall" || hitObject == "bottom wall") y = ball.getYVel() * -1;
		ball.setVel(x, y);
	}
	
	//find the next collision, if we're moving.
	if (ball.getXVel() != 0 || ball.getYVel() != 0){
		dx = (ball.getXVel() < 0) ? ball.getXPos() : 600 - ball.getXPos();
		dxWall = (ball.getXVel() < 0) ? "left wall" : "right wall";
		dy = (ball.getYVel() < 0) ? ball.getYPos() : 400 - ball.getYPos();
		dyWall = (ball.getYVel() < 0) ? "top wall" : "bottom wall";
		tx = Math.round(dx/Math.abs(ball.getXVel()));
		ty = Math.round(dy/Math.abs(ball.getYVel()));
		t = (tx < ty) ? tx : ty;
		hitWall = (tx < ty) ? dxWall : dyWall;
		
		if (t > 0){
			var nextCollision = new event(t + currentGameTime, collision, hitWall, "collision", false);
			timeLine.push(nextCollision);
			timeLine.sort(function (a, b){ return a.time - b.time; });
		}
	}
}
				
function update(){
	
	var m = 0.003;
	var a = Math.atan2(ball.getYPos() - dragon.getYPos(), ball.getXPos() - dragon.getXPos())
	
	x = m*Math.cos(a);
	y = m*Math.sin(a);
	dragon.setAcc(x, y);
	
	dragon.tick(dt);
	
}

function draw(){

	//Start with a clean plate
	if (cleanBlit){
		ctx.clearRect(0, 0, cvs.width, cvs.height);
	}
	dctx.clearRect(0, 0, dcvs.width, dcvs.height);
	
	//Draw the FPS chart
	dctx.beginPath();
	dctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
	dctx.moveTo(10, 10);
	j = 0;
	for (i=0; i<dRTHistory.length; i++){
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
	for (i=0; i<dtHistory.length; i++){
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
	for (i=0; i<29; i++){
		y = 120 + (10 * i) - (currentGameTime % 1000)/100;
		dctx.moveTo(5, y);
		dctx.lineTo(15, y);
	}
	dctx.stroke();
	
	dctx.beginPath(); //Event ticks
	dctx.strokeStyle = "rgba(0, 0, 255, 0.8)";
	for (i=0; i<timeLine.length; i++){
		y = 110 + (timeLine[i].time-currentGameTime)/100
		dctx.moveTo(2, y);
		dctx.lineTo(25, y);
		dctx.fillStyle = "rgba(0, 0, 0, 0.2)";
		dctx.fillText(timeLine[i].desc + ": " + timeLine[i].para, 25, y);
	}
	dctx.stroke();
	
	//Draw ball
	ctx.beginPath();
	ctx.arc(ball.getXPos(), ball.getYPos(), ball.radius, 0, Math.PI*2, true);
	ctx.fillStyle = "rgba(0, 128, 175, 0.8)";
	ctx.fill();
	
	//Draw dragon
	ctx.beginPath();
	ctx.arc(dragon.getXPos(), dragon.getYPos(), dragon.radius, 0, Math.PI*2, true);
	ctx.fillStyle = "rgba(0, 0, 175, 0.8)";
	ctx.fill();
}
