import * as THREE from "/build/three.module.js"
import {GLTFLoader} from "/exemples/loaders/GLTFLoader.js"
import { WEBGL } from "/exemples/WebGL.js";
import {Eye} from "/cubeParts/eye.js"



//fist, check if webGL is available
if (!WEBGL.isWebGLAvailable()) {
	console.error("WebGL is not supported in this browser.")
}
//base code to create the scene
var canvas = document.querySelector("#render")
const renderer = new THREE.WebGLRenderer({canvas,antialias:true})
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.outputEncoding = THREE.sRGBEncoding
document.body.appendChild( renderer.domElement ) //add scene to the page


//set camera fov, pos and look
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 900 )
camera.position.set( 20, 0, 0 )
camera.lookAt( 0, 0, 0 )


const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 )
scene.receiveShadow = true

//***********************
//*** Build the scene ***
//***********************

//import cubes
const loader = new GLTFLoader()

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
	renderer.render( scene, camera )
}

//store future random look
var futureLook = 0

var canvasTexture = new THREE.CanvasTexture(faceCanvas)
var canvasMaterial = new THREE.MeshBasicMaterial({map:canvasTexture})

//create cube
const cube = new THREE.Mesh( geometry, [canvasMaterial,colorMaterial,colorMaterial,colorMaterial,colorMaterial,colorMaterial] )
cube.name = "cubeCharacter"
scene.add( cube )

renderer.render( scene, camera )

//utility
function drawFace(){
	if (mouseInScreen){
		context2d.drawImage(happyImage,0,0)
	}
	else{
		context2d.drawImage(engryImage,0,0)
	}
	drawEyes()

	canvasTexture.needsUpdate = true
	renderer.render( scene, camera )
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


	renderer.render( scene, camera )
	
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


	if (scene.rotation.x != yawGoal || scene.rotation.y != pitchGoal){
		renderer.render( scene, camera )
	}


	//do eyes update
	if (lastBlink+blinkDelay<Date.now()){
		leftEye.blink()
		rightEye.blink()
		blinkDelay = randInt(2000,5000)
		lastBlink = Date.now()
		drawFace()
	}

	if (leftEye.blinking || rightEye.blinking){
		leftEye.update()
		rightEye.update()
		drawFace()
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

	renderer.render( scene, camera )
})

window.addEventListener("mouseover",(event)=>{
	mouseInScreen = true
	drawFace()
})

window.addEventListener("mouseout",(event)=>{
	mouseInScreen = false
	drawFace()
	futureLook = Date.now()+randInt(1000,2000)
})

window.addEventListener("mousemove",(event)=>{
	mouseInScreen = true
	drawFace()
	cubeLook(event.clientX,event.clientY)
})


animate()