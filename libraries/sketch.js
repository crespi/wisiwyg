//------ COCOSSD VARS ------
let video;
let detector;
let detections = [];
let temporaryLabels = [];
let finalLabels = [];
let button, greeting;
let savebutton;

// ------- CHARRNN VARS --------
let charRNN;
let textInput;
let lengthSlider;
let tempSlider;
let runningInference = false;
let status;

let lengthText;
let temperatureText;

let resultText = " ";

var rightBuffer;

function setup() {
	// ------- COCOSSD SETUP --------
	var myCanvas = createCanvas(1272, 510);
	myCanvas.parent("canvascontainer");
	background(255);
	showButtons();
	video = createCapture(VIDEO);
	video.size(600, 450);
	video.hide();
	detector.detect(video, gotDetections);

	// Create a canvas that will be used to save the artwork later
	saveCanvas =  createGraphics(636, 510);

	// ------- CHARRNN SETUP --------
	// Create the LSTM Generator passing it the model directory
	charRNN = ml5.charRNN('./models/woolf/', modelReady);

	// Grab the DOM elements
	status = document.querySelector('#status')

	// ------- ATTNGAN SETUP --------
	rightBuffer = createGraphics(400, 400);
}

function draw() {
	background(255);
	imagePlaceholders();
	// ------- COCOSSD DRAW --------
	image(video, 16, 16);
	fill(0);
	for (let i = 0; i < detections.length; i++) {
		let object = detections[i];
		stroke(0, 255, 0);
		strokeWeight(4);
		noFill();
		rect(object.x, object.y, object.width, object.height);
		noStroke();
		fill(255);
		textSize(16);
		text(object.label, object.x+32, object.y+16);
		//store labels dynamically with each detection
		temporaryLabels[i] = object.label;
	}

	// Artwork title
	fill(0);
	text(resultText, 656 + 600 / 2, 488);
}

// set rectangle placeholders
function imagePlaceholders() {
	noFill();
	strokeWeight(2);
	stroke(200, 200, 200);
	rect(16, 16, 600, 450);
	rect(656, 16, 600, 450);
	textAlign(CENTER, CENTER);
	noStroke();
	fill(100);
	text('Your camera input will appear here', 16 + 600 / 2, 16 + 450 / 2);
	text('Your artwork will appear here', 656 + 600 / 2, 16 + 450 / 2);
}

function showButtons() {
	generatebutton = createButton("Generate your artwork");
	generatebutton.mousePressed(generateArt);
	generatebutton.parent("generatebutton");
}

//download artwork
function saveAsCanvas() {
    let c = get(width/2,0, width, height);
    saveCanvas.image(c, 0, 0);
    save(saveCanvas, frameCount+".png");
}

function generateArt() {
	resultText = 'Generating title';

	// prevent starting inference if we've already started another instance
	if (!runningInference) {
		runningInference = true;
		
		// reset label and change to "generating title"

		// Create a string with temporaryLabels
		const txt = temporaryLabels[Math.floor(Math.random() * temporaryLabels.length)];

		// This is what the LSTM generator needs
		// Seed text, temperature, length to outputs
		// TODO: What are the defaults?
		const data = {
			seed: txt,
			temperature: 1,
			length: 20
		};

		// Generate text with the charRNN
		charRNN.generate(data, gotData);

		resultImage = image(video, video.width + 56, 16);

		filter(GRAY);
		// When it's done
		function gotData(err, result) {
			
			// reset label and change to "generating title"
			resultText = result.sample.toLowerCase().split('.').join("").trim().replace(/^\w/, (c) => c.toUpperCase()) + ".";

			runningInference = false;

			if (!savebutton) {
				savebutton = createButton("Download");
				savebutton.mousePressed(saveAsCanvas);
				savebutton.parent("savebutton");
				savebutton.addClass('save');
			}
		}
	}
}
