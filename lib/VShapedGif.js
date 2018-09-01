const nodes = 5
const w = 500, h = 500
const GifEncoder = require('gifencoder')
const Canvas = require('canvas')
const DELAY = 50
const TDELAY = 15
const COLOR = '#536DFE'
class State {
    constructor() {
        this.scale = 0
        this.dir = 0
        this.prevScale = 0
        this.t = 0
    }

    update(cb) {
        if (this.t == 0) {
            this.scale += 0.1 * this.dir
            console.log(this.scale)
            if (Math.abs(this.scale - this.prevScale) > 1) {
                this.scale = this.prevScale + this.dir
                this.dir = 0
                this.prevScale = this.scale
                this.t++
            }
        } else {
            this.t++
            if (this.t == TDELAY) {
                this.t = 0
                cb()
            }
        }

    }

    startUpdating() {
        if (this.dir == 0) {
           this.dir = 1 - 2 * this.prevScale
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
            this.next = new VShapedNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context) {
        const gap = (Math.min(w, h)/2) / nodes
        const xy = (nodes - (this.i) - 1) * gap
        context.strokeStyle = COLOR
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        for(var i = 0; i < 2; i++) {
            context.save()
            context.translate(w/2, h/2)
            context.scale(1 - 2 * i, 1)
            context.save()
            context.translate(-xy-gap, -xy-gap)
            context.rotate(-Math.PI/4 + Math.PI * this.state.scale)
            context.beginPath()
            context.moveTo(0, 0)
            context.lineTo(0, -gap * Math.sqrt(2))
            context.stroke()
            context.restore()
            context.restore()
        }
        if (this.prev)  {
            this.prev.draw(context)
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

class LinkedVShaped {
    constructor() {
        this.curr = new VShapedNode(0)
        this.dir = 1
    }

    draw(context) {
        this.curr.draw(context)
    }

    update(cb) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            if (this.curr.i == 0 && this.dir == 1) {
                cb()
            } else {
                this.curr.startUpdating()
            }
        })
    }

    startUpdating() {
        this.curr.startUpdating()
    }
}

class Renderer {

    constructor() {
        this.running = true
        this.lvShaped = new LinkedVShaped()
        this.lvShaped.startUpdating()
    }

    render(context, cb, endcb) {
        while(this.running) {
            context.fillStyle = '#BDBDBD'
            context.fillRect(0, 0, w, h)
            this.lvShaped.draw(context)
            cb(context)
            this.lvShaped.update(() => {
                endcb()
                this.running = false
            })
        }
    }
}

class VShapedGif {
    constructor(fn) {
        this.renderer = new Renderer()
        this.encoder = new GifEncoder(w, h)
        this.canvas = new Canvas(w, h)
        this.initEncoder(fn)
    }

    initEncoder(fn) {
        this.encoder.createReadStream().pipe(require('fs').createWriteStream(fn))
        this.encoder.setDelay(DELAY)
        this.encoder.setRepeat(0)
        this.context = this.canvas.getContext('2d')
    }

    render() {
        this.encoder.start()
        this.renderer.render(this.context, (ctx) => {
            this.encoder.addFrame(ctx)
        }, () => {
            this.encoder.end()
        })
    }

    static create(fn) {
        const gif = new VShapedGif(fn)
        gif.render()
    }
}
module.exports = VShapedGif.create
