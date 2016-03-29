"use strict";
define(["linmath", "physics"], function (linmath, physics) {
	var Vector = linmath.Vector;

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
	window.togglePause = function (){ paused = !paused; };
	window.toggleCleanBlit = function (){ cleanBlit = !cleanBlit; };

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

		physics.integrate(page.game.test, currentGameTime, dt / 1000);

		draw();
		requestAnimationFrame(nextFrame);
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

		//Draw physics test thing
		ctx.beginPath();
		ctx.arc(page.game.test.l.x + 200, page.game.test.l.y + 200, 10, 0, Math.PI*2, true);
		ctx.fillStyle = "rgba(0, 175, 64, 0.8)";
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
		game.test = {l: new Vector(80, 0), v: new Vector()};

		//Build some events so something actually happens in the "event-based" game.
		var myEvent2 = new event(20000, function(){}, "How you like this?", "teleport", false);
		var myEvent3 = new event(30000, function(){}, "Haha, gotcha!", "teleport again", false);
		var myEvent4 = new event(180000, function(){}, "", "You must be REALLY bored...", false);
		var myEvent5 = new event(3600000, function(){}, "", "LOL, seriously?!  No more.", false);

		//Add the events to the timeline
		game.timeLine.push(myEvent2);
		game.timeLine.push(myEvent3);
		game.timeLine.push(myEvent4);
		game.timeLine.push(myEvent5);

		//That's enough foreplay - let's get this show on the road!  First frame, here we come...
		nextFrame();
	})();
});
