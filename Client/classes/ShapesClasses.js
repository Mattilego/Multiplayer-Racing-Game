class Point{
    /**
     * @param {number} [x=0] - The x-coordinate of the point.
     * @param {number} [y=0] - The y-coordinate of the point.
     */
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
    /**
     * Move the point relative to another point.
     * @param {Point} [vector=new Point()] - The point to add to the current position.
     */
    moveRelative(vector = new Point()){
        this.x += vector.x;
        this.y += vector.y;
    }
    distanceTo(point){
        return distance(this, point);
    }
    copy(){
        return new Point(this.x, this.y);
    }
    scale(scale){
        this.x *= scale;
        this.y *= scale;
    }
}
class Triangle{
    /**
     * @param {Point} [p1=new Point()] - The first point of the triangle.
     * @param {Point} [p2=new Point()] - The second point of the triangle.
     * @param {Point} [p3=new Point()] - The third point of the triangle.
     * @param {string} [fillColor="#000000"] - The fill color of the triangle.
     * @param {string} [lineColor="#000000"] - The color of the outline of the triangle.
     * @param {number} [lineWidth=2] - The width of the outline of the triangle.
     * @param {string} [lineJoin="round"] - The line join style of the outline of the triangle.
     */
    constructor(p1 = new Point(), p2 = new Point(), p3 = new Point(), fillColor = "#000000", lineColor = "#000000", lineWidth = 2, lineJoin = "round"){
        this.corners = [p1, p2, p3];
        this.fillColor = fillColor;
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.lineJoin = lineJoin;
    }
    /**
     * Draws the triangle on the given rendering context p.
     * The triangle is drawn with its fill color, outline color, line width, and line join style.
     * The triangle is filled and its outline is stroked.
     * @param {CanvasRenderingContext2D} p - The rendering context to draw on.
     */
    draw(p){
        p.fillStyle = this.fillColor;
        p.strokeStyle = this.lineColor;
        p.lineWidth = this.lineWidth;
        p.lineJoin = this.lineJoin;
        p.moveTo(this.corners[0].x, this.corners[0].y);
        p.beginPath();
        p.lineTo(this.corners[1].x, this.corners[1].y);
        p.lineTo(this.corners[2].x, this.corners[2].y);
        p.lineTo(this.corners[0].x, this.corners[0].y);
        p.fill();
        if (this.lineWidth > 0){
            p.stroke();
        }
    }
/**
 * Defines the path of the triangle on the given rendering context p.
 * The path is drawn by moving to the first corner of the triangle and
 * then creating lines to the second and third corners, before closing
 * the path by connecting back to the first corner.
 * @param {CanvasRenderingContext2D} p - The rendering context to define the path on.
 */

    path(p){
        p.moveTo(this.corners[0].x, this.corners[0].y);
        p.lineTo(this.corners[1].x, this.corners[1].y);
        p.lineTo(this.corners[2].x, this.corners[2].y);
        p.lineTo(this.corners[0].x, this.corners[0].y);
    }
}
class GeneralPath{
/**
 * Constructs a new GeneralPath object.
 * @param {Array} [segments=[]] - An array of segments that define the path.
 * @param {string} [fillColor="#000000"] - The fill color for the path.
 * @param {string} [lineColor="#000000"] - The color of the path's outline.
 * @param {number} [lineWidth=2] - The width of the path's outline.
 * @param {string} [lineCap="round"] - The style of the line cap.
 * @param {string} [lineJoin="round"] - The style of the line join.
 */

    constructor(segments = [], fillColor = "#000000", lineColor = "#000000", lineWidth = 2, lineCap = "round", lineJoin = "round"){
        this.segments = segments;
        this.fillColor = fillColor;
        this.lineWidth = lineWidth;
        this.lineColor = lineColor;
        this.lineCap = lineCap;
        this.lineJoin = lineJoin;
    }
/**
 * Defines the path of the GeneralPath on the given rendering context p.
 * Each segment in the GeneralPath is checked for a path method. If it exists,
 * the segment's path method is called with the context p. Otherwise, a line 
 * is drawn to the segment's (x, y) coordinates.
 * @param {CanvasRenderingContext2D} p - The rendering context to define the path on.
 */

    path(p){
        this.segments.forEach(function(segment){
            if (segment.path){
                segment.path(p);
            } else{
                p.lineTo(segment.x, segment.y);
            }
        });
    }
/**
 * Draws the GeneralPath on the given rendering context p.
 * The method begins by setting the initial drawing position to the first segment's coordinates.
 * It then sets the fillStyle, strokeStyle, lineWidth, lineCap, and lineJoin properties for the context.
 * The method iterates over each segment in the path, calling the segment's path method if it exists.
 * If no path method exists, a line is drawn to the segment's (x, y) coordinates.
 * Finally, the path is filled and stroked to render the GeneralPath.
 * @param {CanvasRenderingContext2D} p - The rendering context to draw on.
 */

    draw(p){
        p.moveTo(this.segments[0].x, this.segments[0].y);
        if (this.fillColor instanceof Function){
            p.fillStyle = this.fillColor();
        } else{
            p.fillStyle = this.fillColor;
        }
        p.strokeStyle = this.lineColor;
        p.lineWidth = this.lineWidth;
        p.lineCap = this.lineCap;
        p.lineJoin = this.lineJoin;
        p.beginPath();
            
        this.segments.forEach(function(segment){
            if (segment.path){
                segment.path(p);
            } else{
                p.lineTo(segment.x, segment.y);
            }
        });
        p.fill();
        if(this.lineWidth > 0){
            p.stroke();
        }
    }
}
class Arc{
    /**
     * Creates a new Arc object.
     * @param {Point} [center=new Point()] - The center of the arc.
     * @param {number} [radius=10] - The radius of the arc.
     * @param {number} [startAngle=0] - The angle in radians at which the arc starts.
     * @param {number} [endAngle=2*Math.PI] - The angle in radians at which the arc ends.
     * @param {boolean} [direction=false] - Whether the arc should be drawn clockwise (true) or counterclockwise (false).
     * @param {string|Function} [color="black"] - The fill color of the arc.
     * @param {string} [edgeColor="black"] - The color of the outline of the arc.
     * @param {number} [edgeSize=3] - The width of the outline of the arc.
     */
    constructor(center = new Point(), radius = 10, startAngle = 0, endAngle = 2*Math.PI, direction = false, color = "black", edgeColor = "black", edgeSize = 3){
        this.center = center;
        this.radius = radius;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.direction = direction;
        this.color = color;
        this.edgeColor = edgeColor;
        this.edgeSize = edgeSize;
    }
    /**
     * Draws an arc on the given rendering context.
     * @param {CanvasRenderingContext2D} p - The rendering context to draw on.
     */

    path(p){
        p.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, this.direction);
    }
    /**
     * Draws an arc on the given rendering context.
     * @param {CanvasRenderingContext2D} p - The rendering context to draw on.
     * The arc is drawn with its fill color, outline color, line width, and line join style.
     * The arc is filled and its outline is stroked.
     */
    draw(p){
        p.beginPath();
        p.arc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, this.direction);
        p.moveTo(this.center.x+this.radius*Math.cos(this.startAngle), this.center.y+this.radius*Math.sin(this.startAngle));
        if (this.color instanceof Function){
            p.fillStyle = this.color();
        } else{
            p.fillStyle = this.color;
        }
        
        p.strokeStyle = this.edgeColor;
        p.lineWidth = this.edgeSize;
        p.fill();
        if (this.edgeSize > 0){
            p.stroke();
        }
    }
}
class Shape{
/**
 * Constructs a new Shape object composed of multiple sub-shapes.
 * @param {Array} [shapes=[]] - An array of shape objects that make up the composite shape.
 */

    constructor(shapes = []){
        this.shapes = shapes;
    }
    /**
     * Calls the path method of each sub-shape in this composite shape and passes the given rendering context p.
     * The path method of each sub-shape is called in the order that the sub-shapes are stored in the shapes field of this object.
     * @param {CanvasRenderingContext2D} p - The rendering context to draw on.
     */
    path(p){
        this.shapes.forEach(function(shape){
            if (shape instanceof Function){
                shape().path(p);
            } else{
                shape.path(p);
            }
            p.closePath();
        });
    }
/**
 * Draws the composite shape on the given rendering context p.
 * Calls the draw method of each sub-shape in this composite shape
 * in the order that the sub-shapes are stored in the shapes field
 * of this object.
 * @param {CanvasRenderingContext2D} p - The rendering context to draw on.
 */

    draw(p){
        this.shapes.forEach(function(shape){
            shape.draw(p);
        })
    }
}
