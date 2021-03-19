import * as THREE from "/build/three.module.js"
import { WEBGL } from "/exemples/WebGL.js"
import {EffectComposer} from "/exemples/postprocessing/EffectComposer.js"
import {RenderPass} from "/exemples/postprocessing/RenderPass.js"
import {GlitchPass} from "/exemples/postprocessing/GlitchPass.js"

import {Eye} from "/cubeParts/eye.js"
import {Tear} from "/cubeParts/tear.js"


//fist, check if webGL is available
if (!WEBGL.isWebGLAvailable()) {
	console.error("WebGL is not supported in this browser.")
}
//base code to create the scene
var canvas = document.getElementById("render")
var eventHandler = document.getElementById("eventHandler")

const renderer = new THREE.WebGLRenderer({canvas:canvas,antialias:true})
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.outputEncoding = THREE.sRGBEncoding

//set camera fov, pos and look
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 900 )
camera.position.set( 20, 0, 0 )
camera.lookAt( 0, 0, 0 )

//create scene object
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 )
scene.receiveShadow = true


//create post processing for angry and sad cube
const composer = new EffectComposer(renderer)
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

var glitchPass = new GlitchPass();
glitchPass.enabled = false
console.log(glitchPass)
composer.addPass( glitchPass );


 //add scene to the page
eventHandler.appendChild(renderer.domElement)


//***********************
//*** Build the scene ***
//***********************

//add light
const light = new THREE.AmbientLight( 0xffffff )// soft white light
scene.add( light )


//display axes
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );


var mouseInScreen = true
var yawGoal = 0
var pitchGoal = 0
var rotationSpeed = 0.05

//create cube from scratch to add dynamic face
const geometry = new THREE.BoxGeometry( 5, 5, 5 )

//create basic color material
const colorMaterial = new THREE.MeshBasicMaterial( {color: 0xff00c3} )


//create cube expression with canvas
const faceCanvas = document.createElement("canvas")

var context2d = faceCanvas.getContext("2d")
var happyImage = new Image()
happyImage.src = "/textures/textureHappy.png"

var engryImage = new Image()
engryImage.src = "/textures/textureEngry.png"

var leftEye = new Eye(new THREE.Vector2(33,39),31,68)
var rightEye = new Eye(new THREE.Vector2(111,40),27,68)
var lastBlink = Date.now()
var blinkDelay = 0

happyImage.onload = () =>{
	console.log("loaded")
	faceCanvas.width = happyImage.width
	faceCanvas.height = happyImage.height
	context2d.drawImage(happyImage,0,0)
	drawEyes()

	canvasTexture.needsUpdate = true
}

//store future random look
var futureLook = 0

//efect variables
var lastMouseIn = Date.now()
var lastMouseOut = Date.now()
var tearsDelay = 10000
var futureTear = 0
var tears = []
var tearsImage = new Image()
tearsImage.src = "/textures/tear.png"
var effectDelay = 25000
var wildDelay = 60000
var blackScreenDelay = 70000
var outDelay = 2500

var canvasTexture = new THREE.CanvasTexture(faceCanvas)
var canvasMaterial = new THREE.MeshBasicMaterial({map:canvasTexture})

//create cube
const cube = new THREE.Mesh( geometry, [canvasMaterial,colorMaterial,colorMaterial,colorMaterial,colorMaterial,colorMaterial] )
cube.name = "cubeCharacter"
scene.add( cube )


//utility
function drawFace(){
	if (mouseInScreen){
		context2d.drawImage(happyImage,0,0)
	}
	else{
		context2d.drawImage(engryImage,0,0)
	}
	drawEyes()

	for (var i = tears.length-1; i>-1; i--){
		tears[i].draw(context2d,tearsImage)
		if (tears[i].position.y > faceCanvas.height){
			console.log('Delete tear')
			tears.splice(i,1)
		}

	}

	canvasTexture.needsUpdate = true
}

function drawEyes(){
	leftEye.draw(context2d)
	rightEye.draw(context2d)
}


function cubeLook(x,y) {
	const vect = new THREE.Vector3(camera.position.x + x - window.innerWidth/2,camera.position.y + y - window.innerHeight/2,camera.position.z+50)

	var yaw = vect.angleTo(new THREE.Vector3(1,0,0)) - Math.PI/2
	var pitch = vect.angleTo(new THREE.Vector3(0,1,0)) - Math.PI/2


	yawGoal = -yaw/1.5
	pitchGoal = pitch/1.5	
}


function animate(){
	requestAnimationFrame(animate) //tell three js to reupdate the cube

	//run cube look if necesary
	if (!mouseInScreen && futureLook<Date.now()){
		lookAtRandom()
		futureLook = Date.now()+randInt(1800,3200)
	}

	//moove cube
	var moove = new THREE.Vector2(yawGoal-scene.rotation.y,pitchGoal-scene.rotation.z)


	scene.rotation.y += moove.x/10
	scene.rotation.z += moove.y/10


	//do eyes update
	if (lastBlink+blinkDelay<Date.now()){
		leftEye.blink()
		rightEye.blink()
		blinkDelay = randInt(2000,5000)
		lastBlink = Date.now()
	}

	if (leftEye.blinking || rightEye.blinking){
		leftEye.update()
		rightEye.update()
	}

	//tears
	if (lastMouseIn + tearsDelay < Date.now() && !mouseInScreen){
		if (futureTear == 0){
			futureTear = Date.now()+randInt(2000,5000)
		} else if(futureTear < Date.now()){
			var eye = Math.round(randInt(0,1))
			var x = ((eye == 0) ? leftEye.position.x + randInt(0,leftEye.width) : rightEye.position.x + randInt(0,rightEye.width))
			var y = ((eye == 0) ? leftEye.position.y + leftEye.height : rightEye.position.y + rightEye.height)
			tears.push(new Tear(new THREE.Vector2(x,y)))

			futureTear = Date.now()+randInt(2000,5000)
		}
	}

	drawFace()

	//if mouse go out for too long time, the cube become angry
	if (lastMouseIn + wildDelay < Date.now() && !mouseInScreen){
		glitchPass.goWild = true
	} else if (lastMouseIn + effectDelay < Date.now() && !mouseInScreen){
		glitchPass.enabled = true
	} else {
		glitchPass.goWild = false
	}

	if (lastMouseOut + outDelay < Date.now() && mouseInScreen){
		glitchPass.enabled = false
	}


	//last effect draw
	if (lastMouseIn + blackScreenDelay < Date.now() && !mouseInScreen){
		canvas.style.opacity = "0%"

	} else {
		canvas.style.opacity = "100%"
		composer.render()
	}
	
}


function randInt(min, max) {
  return Math.random() * (max - min) + min;
}


function lookAtRandom(){
	if (!mouseInScreen){
		cubeLook(randInt(0,window.innerWidth),randInt(0,window.innerHeight))
	}
}

//on resize
window.addEventListener("resize", ()=>{

	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize( window.innerWidth, window.innerHeight )
})

//mouse events
eventHandler.addEventListener("mouseover",(event)=>{
	mouseInScreen = true
	drawFace()
	cubeLook(event.clientX,event.clientY)
})

eventHandler.addEventListener("mouseout",(event)=>{
	mouseInScreen = false
	drawFace()
	futureLook = Date.now()+randInt(1000,2000)
	lastMouseIn = Date.now()
})

eventHandler.addEventListener("mouseenter",(event)=>{
	mouseInScreen = true
	drawFace()
	cubeLook(event.clientX,event.clientY)
	lastMouseOut = Date.now()
})

eventHandler.addEventListener("mousemove",(event)=>{
	mouseInScreen = true
	drawFace()
	cubeLook(event.clientX,event.clientY)
})


animate()

setTimeout(() => { //prevent tomb to appear before cube load entierly
	eventHandler.style.backgroundImage = "url('/textures/tomb.svg')"
},1000)