var canvas = document.getElementById('canv');
canvas.width = $(window).width();
canvas.height = 490;

var context = canvas.getContext('2d');
var centerX = canvas.width / 2;
var centerY = canvas.height / 2;

/*
Drawing code:

context.beginPath();
context.strokeStyle = 'rgba(0,0,0,0')';
context.lineWidth = 10;
context.moveTo(x, y);
context.lineTo(x, y);
context.stroke();
*/

var slider = document.getElementById("slider");

var alpha = 0.5;
var beta = 0.5;
var velocity = 1;
var startvel = 1;
var spacing = 1.2566;
var randspacing = 0;
var maxvel = 10000;
var carCount = 5;
var cars = [];

var radius = 100;

// All are doubled
const RECT_WID = 10;
const RECT_LEN = 20;
const ROAD_WID = 18;
const TP = 2 * Math.PI;
const CAR_LEN = Math.PI / 18;
const MS = 20;
const DT = 0.001 * MS;

function mod(n, m) {
    return ((n%m)+m)%m;
};

slider.oninput = function() {
	alpha = (10 - slider.value) / 10;
	beta = slider.value / 10;
	$("#alpha").html(alpha);
	$("#beta").html(beta);
	$("#inalpha").html(alpha);
	$("#inbeta").html(beta);
}

$("#invelocity").change(function() {
	velocity = parseFloat($("#invelocity").val());
	$("#velocity").html(velocity);
});

$("#instartvel").change(function() {
	startvel = parseFloat($("#instartvel").val());
});

$("#inrandspacing").change(function() {
	randspacing = parseFloat($("#inrandspacing").val());
});

$("#inspacing").change(function() {
	spacing = parseFloat($("#inspacing").val());
});

$("#inmaxvel").change(function() {
	maxvel = parseFloat($("#inmaxvel").val());
});

$("#cars").change(function() {
	carCount = parseInt($("#cars").val());
	
	spacing = TP / carCount;
	$("#inspacing").val(spacing);
	
	initSim();
});

function initSim() {
	cars = [];
	
	var interval = spacing < CAR_LEN ? TP / parseInt(carCount) : spacing;
	var randOffset = randspacing > interval - CAR_LEN ? 0 : randspacing;
	
	for (var i = 0; i < parseInt(carCount); i++) {
		cars.push({
			"p": interval * i + Math.random() * randOffset - 0.5 * randOffset,
			"v": startvel
		});
	}
	
	radius = (canvas.width > canvas.height ? canvas.height : canvas.width) * 0.45;
}

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	
	context.beginPath();
	context.fillStyle = "#a3a3a3";
	context.arc(centerX, centerY, radius + ROAD_WID, 0, 2 * Math.PI);
	context.fill();
	
	context.beginPath();
	context.fillStyle = "white";
	context.arc(centerX, centerY, radius - ROAD_WID, 0, 2 * Math.PI);
	context.fill();
	
	context.fillStyle = "#68aeff";
	context.strokeStyle = "black";
	
	for (var car in cars) {
		var pos = cars[car].p;
		var x = centerX + radius * Math.cos(pos);
		var y = centerY + radius * Math.sin(pos);
		
		context.save();
		context.beginPath();
		context.translate(x, y);
		context.rotate(pos);
		context.rect(-RECT_WID, -RECT_LEN, RECT_WID * 2, RECT_LEN * 2);
		context.fill();
		context.stroke();
		context.restore();
	}
}

function update() {
	var c, n;
	var newCars = [];
	var newCar;
	
	for (var car in cars) {
		cars[car].p = mod(cars[car].p, TP);
	}
	
	for (var car in cars) {
		newCar = {};
		
		n = cars[(parseInt(car) + 1) % parseInt(carCount)];
		c = cars[car];
		
		var diff = mod(n.p - c.p, TP) < CAR_LEN ? CAR_LEN : mod(n.p - c.p, TP);
		
		//console.log(DT + " * " + alpha + " * (" + n.v + " - " + c.v + ") / " + diff + " + " + beta + " * (" + velocity + " * " + diff + " - " + c.v + ")"); 
		
		newCar.v = c.v + DT * alpha * (n.v - c.v) / diff + beta * (velocity * diff - c.v);
		if (newCar.v > maxvel) newCar.v = maxvel;
		
		newCar.p = c.p + DT * c.v;
		newCars.push(newCar);
	}
	
	cars = newCars;
	
	draw();
}

initSim();
setInterval(update, MS);