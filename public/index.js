import * as THREE from "/build/three.module.js"
import {GLTFLoader} from "/exemples/loaders/GLTFLoader.js"
import { WEBGL } from "/exemples/WebGL.js";



//fist, check if webGL is available
if (!WEBGL.isWebGLAvailable()) {
	console.error("WebGL is not supported in this browser.")
}
//base code to create the scene
var canvas = document.querySelector("#render")
const renderer = new THREE.WebGLRenderer({canvas})
//renderer.setSize( window.innerWidth, window.innerHeight )
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

//load cubes
loader.load("/3Dmodels/happyCube.glb",(gltf)=>{
	gltf.scene.name = "HappyScene"
	scene.add( gltf.scene )

	renderer.render( scene, camera )
}, undefined, (error)=>{
	console.error(error)
})

loader.load("/3Dmodels/engryCube.glb",(gltf)=>{
	gltf.scene.name = "EngryScene"

	gltf.visible = false
	scene.add( gltf.scene )

}, undefined, (error)=>{
	console.error(error)
})

//utility
function switchHappy(happy=true){
	scene.getObjectByName("HappyScene").visible = happy
	scene.getObjectByName("EngryScene").visible = !happy

	renderer.render( scene, camera )
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


	scene.rotation.y = scene.rotation.y  + (yawGoal < scene.rotation.y ? -rotationSpeed : rotationSpeed)
	scene.rotation.y = Math.abs(scene.rotation.y-yawGoal)<rotationSpeed*2 ? yawGoal : scene.rotation.y
	scene.rotation.z = scene.rotation.z  + (pitchGoal < scene.rotation.z ? -rotationSpeed : rotationSpeed)
	scene.rotation.z = Math.abs(scene.rotation.z-pitchGoal)<rotationSpeed*2 ? pitchGoal : scene.rotation.z

	if (scene.rotation.x != yawGoal || scene.rotation.y != pitchGoal){
		renderer.render( scene, camera )
	}

}


function randInt(min, max) {
  return Math.random() * (max - min) + min;
}


function lookAtRandom(){
	if (!mouseInScreen){
		cubeLook(randInt(0,window.innerWidth),randInt(0,window.innerHeight))

		setTimeout(lookAtRandom,randInt(1000,2000))
	}
}

//on resize
window.addEventListener("resize", ()=>{

	camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

	renderer.render( scene, camera )
})

window.addEventListener("mouseover",(event)=>{
	mouseInScreen = true
	switchHappy()
})

window.addEventListener("mouseout",(event)=>{
	switchHappy(false)
	mouseInScreen = false
	setTimeout(lookAtRandom,randInt(500,1500))
})

window.addEventListener("mousemove",(event)=>{
	mouseInScreen = true
	cubeLook(event.clientX,event.clientY)
})


animate()