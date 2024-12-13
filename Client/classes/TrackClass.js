/**
 * Constructs a new Track instance.
 * 
 * @param {Shape} visual - The visual representation of the track.
 * @param {string} background - The background color of the track.
 * @param {number} scale - The scale factor for rendering the track.
 * @param {Shape} offroad - The shape defining the offroad areas.
 * @param {Shape} walls - The shape defining the track's walls.
 * @param {Shape} boostPanels - The shape defining the boost panels.
 * @param {Shape} slipperyRoad - The shape defining slippery road areas.
 * @param {GeneralPath} path - The path defining the racing line.
 * @param {number} laps - The number of laps required to complete the track.
 * @param {GeneralPath[]} checkpoints - The array of checkpoint paths.
 * @param {ItemBox[]} itemBoxes - The array of item boxes on the track.
 * @param {Item[]} items - The array of items (like nitro crystals) on the track.
 * @param {Racer[]} racers - The array of racers participating on the track.
 */
class Track{
    constructor(visual = new shape(), background = "gray", scale = 1, offroad = new shape(), walls = new shape(), boostPanels = new shape(), slipperyRoad = new shape(), path = new generalPath([new point(), new point()]), laps = 3, checkpoints = [new generalPath()], itemBoxes = [], items = [], racers = []){
        this.visual = visual;
        this.background = background;
        this.scale = scale;
        this.offroad = offroad;
        this.walls = walls;
        this.boostPanels = boostPanels;
        this.slipperyRoad = slipperyRoad;
        this.path = path;
        this.laps = laps;
        this.checkpoints = checkpoints;
        this.itemBoxes = itemBoxes;
        this.items = items;
        this.racers = racers;
    }
/**
 * Draws the track on a given canvas context. It scales the canvas context 
 * according to the track's scale factor, draws the visual representation 
 * of the track, and then resets the scale transformation.
 * 
 * @param {CanvasRenderingContext2D} p - The canvas context on which to draw the track.
 */

    draw(p){
        p.save();
        p.transform(this.scale, 0, 0, this.scale, 0, 0);
        this.visual.draw(p);
        p.restore();
    }

    getBounds(){
        return this.findBounds(this.visual);
    }

    findBounds(shape) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        if (shape instanceof Shape) {
            // Recursively check each shape in the shape class
            for (const subShape of shape.shapes) {
                const bounds = this.findBounds(subShape);
                minX = Math.min(minX, bounds.x);
                minY = Math.min(minY, bounds.y);
                maxX = Math.max(maxX, bounds.x + bounds.width);
                maxY = Math.max(maxY, bounds.y + bounds.height);
            }
        } else if (shape instanceof GeneralPath) {
            // Check each segment in the path
            for (const segment of shape.segments) {
                if (segment instanceof Point) {
                    minX = Math.min(minX, segment.x);
                    minY = Math.min(minY, segment.y);
                    maxX = Math.max(maxX, segment.x);
                    maxY = Math.max(maxY, segment.y);
                } else if (segment instanceof Arc) {
                    // For arcs, check the center and points at 0, 90, 180, and 270 degrees
                    const center = segment.center;
                    const radius = segment.radius;
                    
                    // Check center point
                    minX = Math.min(minX, center.x);
                    minY = Math.min(minY, center.y);
                    maxX = Math.max(maxX, center.x);
                    maxY = Math.max(maxY, center.y);
                    
                    // Check points at cardinal angles
                    const angles = [0, Math.PI/2, Math.PI, Math.PI*3/2];
                    for (const angle of angles) {
                        // Only include points if they're within the arc's angle range
                        const pointAngle = (angle - segment.startAngle) % (Math.PI * 2);
                        if (pointAngle >= 0 && pointAngle <= Math.abs(segment.endAngle - segment.startAngle)) {
                            const x = center.x + radius * Math.cos(angle);
                            const y = center.y + radius * Math.sin(angle);
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                        }
                    }
                } else if (segment instanceof Triangle) {
                    // Check all three points of the triangle
                    for (const point of [segment.p1, segment.p2, segment.p3]) {
                        minX = Math.min(minX, point.x);
                        minY = Math.min(minY, point.y);
                        maxX = Math.max(maxX, point.x);
                        maxY = Math.max(maxY, point.y);
                    }
                }
            }
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
}
