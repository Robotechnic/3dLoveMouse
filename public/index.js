import * as THREE from "/build/three.module.js"
import {GLTFLoader} from "/exemples/loaders/GLTFLoader.js"
import { WEBGL } from "/exemples/WebGL.js";



//fist, check if webGL is available
if (!WEBGL.isWebGLAvailable()) {
	console.error("WebGL is not supported in this browser.")
}
//base code to create the scene
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.outputEncoding = THREE.sRGBEncoding
document.body.appendChild( renderer.domElement ) //add scene to the page


//set camera fov, pos and look
const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 900 )
camera.position.set( 20, 0, 20 )
camera.lookAt( 0, 0, 0 )


const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff )
scene.receiveShadow = true

//***********************
//*** Build the scene ***
//***********************

//import cubes
const loader = new GLTFLoader()

//add light
const light = new THREE.AmbientLight( 0xffffff ) // soft white light
scene.add( light )


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


//on resize
window.addEventListener("resize", ()=>{

	camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

	renderer.setSize( window.innerWidth, window.innerHeight)

	renderer.render( scene, camera )
	console.log("resize")
})