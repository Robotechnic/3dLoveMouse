import {Vector2} from "/build/three.module.js"

class Eye {
	constructor(position, width,height){
		this.position = position
		this.width= width
		this.height = height
		this.blinkHeight = 0
		this.blinkDirection = 0
		this.blinking = false
	}

	draw(context2d){
		context2d.fillStyle = "black"
		context2d.fillRect(this.position.x, this.position.y+this.blinkHeight, this.width, this.height-this.blinkHeight)
	}

	moove(moove) {
		this.position += moove
	}

	blink() {
		this.blinking = true
	}

	update() {
		if (this.blinking){
			if (this.blinkDirection == 0 && this.blinkHeight<this.height){
				this.blinkHeight += 15
			} else if (this.blinkHeight >= this.height){
				this.blinkDirection = 1
			}
			if (this.blinkDirection == 1 && this.blinkHeight>0){
				this.blinkHeight -= 10
			} else if (this.blinkHeight <= 0){
				this.blinkHeight = 0
				this.blinkDirection = 0
				this.blinking = false
			}
		}
	}
}

export {Eye}