import {Vector2} from "/build/three.module.js"

var tearSpeed = .8

class Tear {

	constructor(position){
		this.position = position
		this.lastEvolve = Date.now()
	}

	draw(context2d,tearImg){
		this.evolve()
		context2d.drawImage(tearImg,this.position.x,this.position.y,30,44)
	}

	evolve(){
		this.position.y += tearSpeed+(Date.now()-this.lastEvolve)/1000
		this.lastEvolve = Date.now()
	}
}


export {Tear}