class ItemBox{
    /**
     * Initializes a new instance of the ItemBox class.
     *
     * @param {Point} position - The initial position of the item box.
     * @param {number} delay - The delay before the item box activates.
     */

    constructor(position = new Point(), delay = 0){
        this.averagePosition = position;
        this.position = position;
        this.delay = delay;
    }
    /**
     * Draws the item box on the given rendering context p.
     * The item box is a rhombus shape with a gradient fill and a question mark symbol in the center.
     * The size of the item box is proportional to the delay before it activates.
     * The item box moves up and down slightly to give the illusion of movement.
     * The item box is drawn with a white outline and a translucent fill.
     * The question mark symbol is drawn in a bold font with a white fill and a darker outline.
     * @param {CanvasRenderingContext2D} p - The rendering context to draw on.
     */
    draw(p){
        let t = new Date();
        t = t.getTime()/1000;
        this.position = new Point(this.averagePosition.x * tracks[trackNr-1].scale, this.averagePosition.y*tracks[trackNr-1].scale + 5*Math.sin(t*Math.PI));
        const size = (this.delay * (this.delay < 0) - this.delay + 40 + this.delay * (this.delay > 40))*(this.delay < 40)/3;
        const g = p.createLinearGradient(this.position.x - size, this.position.y - size, this.position.x + size, this.position.y + size);
        g.addColorStop(0, `hsla(${200+40*Math.sin(t*4)}, 100%, 80%, 0.5)`);
        g.addColorStop(0.4, `hsla(${200+40*Math.sin(t*4+Math.PI/2)}, 100%, 80%, 0.5)`);
        g.addColorStop(0.6, `hsla(${200+40*Math.sin(t*4+Math.PI)}, 100%, 80%, 0.5)`);
        g.addColorStop(1, `hsla(${200+40*Math.sin(t*4+Math.PI*3/2)}, 100%, 80%, 0.5)`);
        p.fillStyle = g;
        p.moveTo(this.position.x + size * Math.cos(t), this.position.y + size * Math.sin(t));
        p.beginPath();
        p.lineTo(this.position.x + size * Math.cos(t+Math.PI/2), this.position.y + size * Math.sin(t+Math.PI/2));
        p.lineTo(this.position.x + size * Math.cos(t+Math.PI), this.position.y + size * Math.sin(t+Math.PI));
        p.lineTo(this.position.x + size * Math.cos(t+Math.PI*3/2), this.position.y + size * Math.sin(t+Math.PI*3/2));
        p.lineTo(this.position.x + size * Math.cos(t), this.position.y + size * Math.sin(t));
        p.fill();
        p.fillStyle = "hsla(0, 0%, 90%, 0.3)";
        p.font = "" + size*1.5 + "px Arial";
        p.lineWidth = "2px";
        p.strokeStyle = "hsla(0, 0%, 60%, 0.6)";
        p.strokeText("?", this.position.x - size*9/20, this.position.y + size*11/20);
        p.fillText("?", this.position.x - size*9/20, this.position.y + size*11/20);
    }
    update(){
        this.delay -= 1
    }
}

