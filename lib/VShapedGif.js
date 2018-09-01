const nodes = 5
const w = window.innerWidth, h = window.innerHeight
class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
    }

    update(cb) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            ths.prevScale = this.scale
            cb()
        }
    }

    startUpdating() {
        if (this.dir == 0) {
           this.dir = 1 - 2 * this.prevScale
           cb()
        }
    }
}

class VShapedNode {
    constructor(i) {
        this.i = i
        this.state = new State()
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new VShapedNode(i)
            this.next.prev = this
        }
    }

    draw(context) {
        const gap = (Math.min(w, h)/2) / nodes
        const xy = (nodes - (this.i) + 1) * gap
        context.strokeStyle = '#4CAF50'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        for(var i = 0; i < 2; i++) {
            context.save()
            context.translate(w/2, h/2)
            context.scale(1 - 2 * i, 1)
            context.save()
            context.translate(-xy-gap, -xy-gap)
            context.rotate(Math.PI/4 + Math.PI * this.state.scale)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, -gap * Math.sqrt(2))
            context.stroke()
            context.restore()
            context.restore()
        }
    }

    update(cb) {
        this.state.update(cb)
    }

    startUpdating() {
        this.state.startUpdating()
    }

    getNext(dir, cb) {
        var curr = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}