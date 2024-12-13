class Racer {
    /**
     * Constructs a new Racer instance.
     * 
     * @param {number} topSpeed - The maximum speed of the car.
     * @param {number} maxReverseSpeed - The maximum reverse speed of the car.
     * @param {number} acceleration - The rate at which the car accelerates.
     * @param {number} driftThreshold - The speed at which the car enters drift mode.
     * @param {number} handling - The rate at which the car turns.
     * @param {Shape} car - The visual representation of the car.
     * @param {Point} position - The starting position of the car.
     * @param {number} angle - The starting angle of the car in radians.
     * @param {boolean} isPlayer - Whether the car is the player's or not.
     */
   
    constructor(
        // Movement & drift properties
        topSpeed = 10, 
        maxReverseSpeed = -5, 
        acceleration = 0.04,
        handling = 0.1,
        driftThreshold = 30,
        
        // Physical properties
        collisionRadius = 20,
        car = new Shape(),
        position = new Point(),
        angle = 0,
        
        // Game properties
        isPlayer = false,
        id
    ) {
        // Permanent movement stats characteristics
        this.topSpeed = topSpeed;
        this.maxReverseSpeed = maxReverseSpeed;
        this.acceleration = acceleration;
        this.handling = handling;
        this.driftThreshold = driftThreshold;
        this.friction = 0.08;
        this.driftBoostSpeed = 1.4;
        this.itemBoostSpeed = 1.6;
        
        // Permanent physical characteristics
        this.collisionRadius = collisionRadius;
        this.car = car;
        this.isPlayer = isPlayer;
        this.id = id ||Math.random();
        
        // Movement state
        this.speed = 0;
        this.position = position;
        this.angle = angle;
        this.driftChargeTime = 0;
        this.driftDirection = "right";
        this.wasDrifting = false;
        this.driftBoostDuration = 0;
        
        // Input state
        this.isAccelerating = false;
        this.isDecelerating = false;
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.isDrifting = false;
        
        // Item state
        this.items = [];
        this.itemBoostDuration = 0;
        this.useItemRequest = false;
        this.nitroCrystals = 0;
        this.hasForceField = false;
        this.forceFieldTimer = 0;
        this.isEMPed = false;
        this.empTimer = 0;
        
        // Game state
        this.currentLap = 1;
        this.checkpoints = 0;
        this.controlsReversed = false;
        this.cotrolsReversedTimer = 0; // Timer for controls reversion

        // State machine
        this.state = "normal";
        this.stateTimer = -1;
    }

    setState(newState, stateTimer = -1) {
        if (newState === "spun out" && this.hasForceField) {
            this.hasForceField = false;
            return;
        }
        this.state = newState;
        this.stateTimer = stateTimer;
    }

/**
 * Draws the Racer on the canvas.
 * The color of the Racer changes based on the drift charge time:
 * - Black: default
 * - Blue: if driftChargeTime > driftThreshold
 * - Orange: if driftChargeTime > 1.75 * driftThreshold
 * - Purple: if driftChargeTime > 2.5 * driftThreshold
 * Also draws a red line indicating the Racer's direction.
 * 
 * @param {CanvasRenderingContext2D} p - The rendering context used for drawing.
 */

    draw(p) {
        // Draw EMP effect if active
        if (this.isEMPed) {
            const t = new Date().getTime() / 1000;
            p.save();
            p.translate(this.position.x, this.position.y);
            
            // Create electric effect
            const baseRadius = this.collisionRadius * 1.2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + t * 5;
                const sparkLength = 5 + Math.sin(t * 10 + i) * 3;
                
                p.beginPath();
                p.strokeStyle = `rgba(255, 255, 0, ${0.5 + Math.sin(t * 15 + i) * 0.5})`;
                p.lineWidth = 2;
                p.moveTo(
                    baseRadius * Math.cos(angle),
                    baseRadius * Math.sin(angle)
                );
                p.lineTo(
                    (baseRadius + sparkLength) * Math.cos(angle + Math.sin(t * 20) * 0.2),
                    (baseRadius + sparkLength) * Math.sin(angle + Math.sin(t * 20) * 0.2)
                );
                p.stroke();
            }
            
            p.restore();
        }
        
        // Draw the forcefield if active
        if (this.hasForceField) {
            const t = new Date().getTime() / 1000;
            p.save();
            p.translate(this.position.x, this.position.y);
            
            // Create pulsing forcefield effect
            const baseRadius = this.collisionRadius * 1.5;
            const pulseRadius = baseRadius + Math.sin(t * 5) * 3;
            
            // Flash effect when timer is low (last 60 frames)
            const opacity = this.forceFieldTimer <= 60 ? (0.3 + Math.sin(t * 15) * 0.3) : 0.3;
            
            // Draw outer glow
            const gradient = p.createRadialGradient(0, 0, baseRadius - 5, 0, 0, pulseRadius + 5);
            gradient.addColorStop(0, `rgba(100, 200, 255, ${opacity})`);
            gradient.addColorStop(0.7, `rgba(100, 200, 255, ${opacity/3})`);
            gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
            
            p.beginPath();
            p.fillStyle = gradient;
            p.arc(0, 0, pulseRadius + 5, 0, 2 * Math.PI);
            p.fill();
            
            // Draw shield border with flashing effect
            const borderOpacity = this.forceFieldTimer <= 60 ? (0.8 + Math.sin(t * 15) * 0.2) : (0.8 + Math.sin(t * 8) * 0.2);
            p.beginPath();
            p.strokeStyle = `rgba(100, 200, 255, ${borderOpacity})`;
            p.lineWidth = 2;
            p.arc(0, 0, pulseRadius, 0, 2 * Math.PI);
            p.stroke();
            
            p.restore();
        }
        
        p.fillStyle = "black";
        if (this.driftChargeTime > this.driftThreshold) {
            p.fillStyle = "blue";
            if (this.driftChargeTime > 1.75 * this.driftThreshold) {
                p.fillStyle = "orange";
                if (this.driftChargeTime > 2.5 * this.driftThreshold) {
                    p.fillStyle = "purple";
                }
            }
        }
        p.beginPath();
        p.arc(this.position.x, this.position.y, 20, 0, 2 * Math.PI);
        p.fill();
        p.strokeStyle = "red";
        p.lineWidth = 2;
        p.beginPath();
        p.moveTo(this.position.x + 20 * Math.cos(this.angle), this.position.y + 20 * Math.sin(this.angle));
        p.lineTo(this.position.x + 20 * Math.cos(this.angle + Math.PI * 0.8), this.position.y + 20 * Math.sin(this.angle + Math.PI * 0.8));
        p.lineTo(this.position.x + 20 * Math.cos(this.angle - Math.PI * 0.8), this.position.y + 20 * Math.sin(this.angle - Math.PI * 0.8));
        p.lineTo(this.position.x + 20 * Math.cos(this.angle), this.position.y + 20 * Math.sin(this.angle));
        p.stroke();
    }

    /**
     * Updates the Racer's state by:
     * - handling acceleration/deceleration
     * - handling being on/off the road
     * - handling boost panels
     * - handling drifting
     * - applying temporary speed boosts (drift or item)
     * - updating the Racer's position
     * - handling collisions with walls
     */
    update() {
        this.reverseControls();
        this.handleAcceleration();
        this.handleOffroad(tracks[trackNr - 1]);
        this.handleBoostPanels(tracks[trackNr - 1]);
        this.handleDrifting();
        this.applyBoosts();
        
        // Handle item usage
        if (this.useItemRequest && this.items.length > 0) {
            this.useItem();
        }
        this.handleItemCollisions();
        this.handleWalls(tracks[trackNr - 1]);
        this.updatePosition();
        this.updateState();
        this.updateCheckpoints();
        this.resetActions();
    }

    /**
     * Handles the acceleration/deceleration of the Racer based on the "isAccelerating" and "isDecelerating" properties.
     * If the Racer is accelerating, it increases its speed until it reaches the top speed.
     * If the Racer is decelerating, it decreases its speed until it reaches the max reverse speed.
     * If the Racer is neither accelerating nor decelerating, it applies a friction force to slow down.
     */
    handleAcceleration() {
        if (this.state === "normal" || this.state === "drifting") {
            const accelerationState = this.isAccelerating - this.isDecelerating;
            switch (accelerationState) {
                case 1:
                    this.speed += this.acceleration * (this.topSpeed - this.speed);
                    break;
                case 0:
                    this.speed -= this.friction * this.speed;
                    break;
                case -1:
                    this.speed += this.acceleration * (this.maxReverseSpeed - this.speed);
                    break;
            }
        } else if (this.state === "spun out") {
            this.driftChargeTime = 0;
            this.speed -= this.friction * (this.speed-this.friction*this.speed);
            this.angle += Math.PI/20;
        } else if (this.state === "starting drift") {
            this.speed -= this.friction * this.speed/3;
        }
    }

/**
 * Handles the behavior of the Racer when it is offroad.
 * Scales the drawing context to match the track's scale, then checks if 
 * the Racer's position is within the offroad path of the track.
 * If the Racer is offroad, it reduces the speed and stops drifting.
 *
 * @param {Track} track - The current track the Racer is on, used to 
 * determine the offroad path and scale.
 */

    handleOffroad(track) {
        p.save();
        p.scale(track.scale, track.scale);
        p.beginPath();
        track.offroad.path(p);
        const offroadCheckRadius = 5;
        let isOffroad = false;

        for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 16) {
            const checkX = this.position.x + offroadCheckRadius * Math.cos(angle) - racers[0].position.x + canvas.width / 2;
            const checkY = this.position.y + offroadCheckRadius * Math.sin(angle) - racers[0].position.y + canvas.height / 2;
            if (p.isPointInPath(checkX, checkY)) {
                isOffroad = true;
                break;
            }
        }

        if (isOffroad) {
            this.speed *= 0.95;
            this.isDrifting = false;
        }
    }

    /**
     * Handles the behavior of the Racer when it collides with a wall on the track.
     * This is done by finding the angle of the wall relative to the Racer's current
     * direction, then reflecting the Racer's velocity vector across that angle.
     * The Racer's new position is then updated to ensure that it is no longer in the wall.
     * The Racer's speed is also updated to match the magnitude of the new velocity vector.
     * @param {Track} track - The current track the Racer is on, used to determine the wall path.
     */
    handleWalls(track) {
        p.save();
        p.beginPath();
        track.walls.path(p);
        
        // Reduced sampling points and added early exit
        const samplingPoints = 64; // Reduced from 1000
        const wallAngles = [];
        let isInWall = false;

        for (let i = 0; i < samplingPoints; i++) {
            const angle = this.angle + Math.PI * (i / (samplingPoints/2));
            const xOffset = Math.cos(angle) * (this.collisionRadius+5);
            const yOffset = Math.sin(angle) * (this.collisionRadius+5);
            
            const checkX = this.position.x - racers[0].position.x + canvas.width / 2 + xOffset;
            const checkY = this.position.y - racers[0].position.y + canvas.height / 2 + yOffset;
            
            if (p.isPointInPath(checkX, checkY)) {
                let relativeAngle = angle - this.angle;
                // Normalize angle
                relativeAngle = relativeAngle > Math.PI ? relativeAngle - 2 * Math.PI : relativeAngle;
                wallAngles.push(relativeAngle);
            }
            const xOffset2 = Math.cos(angle) * this.collisionRadius;
            const yOffset2 = Math.sin(angle) * this.collisionRadius;
            
            const checkX2 = this.position.x - racers[0].position.x + canvas.width / 2 + xOffset2;
            const checkY2 = this.position.y - racers[0].position.y + canvas.height / 2 + yOffset2;
            
            if (p.isPointInPath(checkX2, checkY2)) {
                isInWall = true;
            }
        }
        if (isInWall && wallAngles.length > 0) {
            const totalAngle = wallAngles.reduce((sum, angle) => sum + angle, 0);
            const averageAngle = totalAngle / wallAngles.length;
            
            const wallTangent = new Point(
                Math.cos(averageAngle + this.angle + Math.PI / 2), 
                Math.sin(averageAngle + this.angle + Math.PI / 2)
            );
            
            const velocity = new Point(
                this.speed * Math.cos(this.angle), 
                this.speed * Math.sin(this.angle)
            );
            
            // Calculate dot product with wall normal
            const dotProduct = velocity.x * wallTangent.x + velocity.y * wallTangent.y;
            
            // Calculate the parallel component (sliding along wall)
            // by subtracting the normal component from the velocity
            const parallelVelocity = new Point(
                dotProduct * wallTangent.x,
                dotProduct * wallTangent.y
            );
            
            const newSpeed = Math.sqrt(parallelVelocity.x ** 2 + parallelVelocity.y ** 2);
            
            // Binary search wall escape mechanism
            const samplingPoints = 64; // Match the sampling points from collision detection
            let moveX = 0, moveY = 0;
            let minMove = 0;
            let maxMove = Math.abs(this.speed); // Start with a generous maximum
            let iterations = 0;
            const maxIterations = 10; // Prevent infinite loops while ensuring good precision
            
            while (iterations < maxIterations) {
                const currentMove = (minMove + maxMove) / 2;
                let isInWall = false;
                
                // Check points around the racer using same sampling as collision detection
                for (let i = 0; i < samplingPoints; i++) {
                    const angle = this.angle + Math.PI * (i / (samplingPoints/4) - 2);
                    const xOffset = Math.cos(angle) * this.collisionRadius;
                    const yOffset = Math.sin(angle) * this.collisionRadius;
                    
                    const checkX = this.position.x - racers[0].position.x + canvas.width / 2 
                        - velocity.x * currentMove + xOffset;
                    const checkY = this.position.y - racers[0].position.y + canvas.height / 2 
                        - velocity.y * currentMove + yOffset;
                    
                    if (p.isPointInPath(checkX, checkY)) {
                        isInWall = true;
                        break;
                    }
                }
                
                if (isInWall) {
                    minMove = currentMove;
                } else {
                    maxMove = currentMove;
                    moveX = -velocity.x * currentMove;
                    moveY = -velocity.y * currentMove;
                }
                
                // If we've reached sufficient precision, break
                if (maxMove - minMove < 0.1) break;
                iterations++;
            }
            
            this.position.moveRelative(new Point(moveX, moveY));
            
            this.angle = Math.atan2(parallelVelocity.y, parallelVelocity.x) 
                - 0.1 * Math.sign(averageAngle) 
                + Math.PI * (this.speed < 0);
            
            this.speed = Math.abs(newSpeed) * Math.sign(this.speed);
        }
        
        p.restore();
    }


    /**
     * Check if the player is currently inside a boost panel and if so, activate boost.
     * @param {Track} track The track on which the player is currently racing.
     */
    handleBoostPanels(track) {
        if (this.state === "spun out") {
            return;
        }
        p.beginPath();
        track.boostPanels.path(p);
        
        // Check 16 points in a circle around the racer
        const radius = 20; // Radius of detection circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const points = 16;
        
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (p.isPointInPath(x, y)) {
                this.driftBoostDuration = 30;
                break;
            }
        }
    }

    /**
     * Manages the Racer's drifting behavior and updates drift-related properties.
     * If the Racer is currently drifting, it adjusts the speed slightly downward,
     * updates the drift charge time based on the Racer's turning direction, and
     * stops drifting if the speed drops below a certain threshold.
     * If the Racer was drifting but is no longer, it calculates and applies a
     * drift boost based on the accumulated drift charge time.
     */

    handleDrifting() {
        if (this.isEMPed) return; // Can't drift while EMPed
        
        if (this.state === "normal"){
            if (this.isDrifting){
                if (this.isTurningLeft-this.isTurningRight !== 0){
                    this.driftDirection = this.isTurningLeft > this.isTurningRight ? "left" : "right";
                    this.setState("starting drift", 10);
                }
            }
            if (this.driftChargeTime > 0){
                this.driftBoostDuration += 5 * (this.driftChargeTime > this.driftThreshold) + 10 * (this.driftChargeTime > 1.9 * this.driftThreshold) + 18 * (this.driftChargeTime > 2.8 * this.driftThreshold);
                this.driftChargeTime = 0;
            }
        } else if (this.state === "starting drift"){
        } else if(this.state === "drifting"){
            this.speed *= 0.995;
            this.driftChargeTime += Math.sqrt((2 * (this.driftDirection === "right") - 1) * (this.isTurningRight - this.isTurningLeft) / 2 + 1);
            if (this.speed < this.topSpeed/5) {
                this.driftChargeTime = 0;
            }
            if (!(this.isDrifting)){
                this.stateTimer = 0;
            }
        }
    }

    /**
     * Applies any active boosts to the Racer's speed. If an item boost is active,
     * it increases the speed to the top speed multiplied by the item boost speed
     * and decreases the item boost duration by one. If no item boost is active but
     * a drift boost is, it increases the speed to the top speed multiplied by the
     * drift boost speed and decreases the drift boost duration by one.
     */
    applyBoosts() {
        if (this.state !== "teleporting") {
            if (this.itemBoostDuration > 0) {
                this.speed = this.topSpeed * this.itemBoostSpeed;
                this.itemBoostDuration -= 1;
            } else if (this.driftBoostDuration > 0) {
                this.speed = this.topSpeed * this.driftBoostSpeed;
                this.driftBoostDuration -= 1;
            }
        }
    }

    /**
     * Updates the Racer's position and angle based on its current speed and
     * handling. If the Racer is not drifting, it turns at a constant rate based
     * on its current speed and handling. If the Racer is drifting, it turns at
     * a rate that is proportional to the Racer's handling, but with a slight
     * modification to the rate based on the player's input. The player's input
     * is still taken into account when drifting, but the rate at which the
     * Racer turns is adjusted to make drifting more stable and predictable.
     */
    updatePosition() {
        if (this.state === "normal") {
            this.angle += this.handling * Math.min(this.speed / (this.topSpeed / 3), 1) * (0.5 + 0.5 * Math.pow(Math.abs(1 - (this.speed / this.topSpeed)) / 2, 0.7)) * (this.isTurningRight - this.isTurningLeft);
        } else if (this.state === "drifting") {
            if (this.driftDirection === "right") {
                this.angle += 0.03 + (this.isTurningRight - this.isTurningLeft) * Math.pow(this.handling, 0.5) * 0.03;
            } else {
                this.angle -= 0.03 - (this.isTurningRight - this.isTurningLeft) * Math.pow(this.handling, 0.5) * 0.03;
            }
        } else if (this.state === "starting drift") {
            this.angle += 0.1 * Math.pow(this.handling, 0.5) * (this.driftDirection === "right" ? 1 : -1);
        } else if (this.state === "teleporting") {
            if (this.stateTimer > 0) {
                // TODO: Add teleport visual effects here
                
            } else {
                // End teleport
                const teleportDistance = this.speed * 15 + 300; 
                this.position.moveRelative(new Point(teleportDistance * Math.cos(this.angle), teleportDistance * Math.sin(this.angle)));
                this.speed = this.speed * 1.5; 
            }
        }
        
        // Move the racer if not teleporting (teleporting has its own movement)
        if (this.state !== "teleporting") {
            let totalSpeed = this.speed * (1 + this.nitroCrystals * 0.02);
            this.position.moveRelative(new Point(
                totalSpeed * Math.cos(this.angle),
                totalSpeed * Math.sin(this.angle)
            ));
        }
        
        this.wasDrifting = this.isDrifting;
    }

    updateState(){
        if (this.stateTimer == 0) {
            this.setState(NextState[this.state]);
        }
        this.stateTimer--;

        // Update forcefield timer
        if (this.hasForceField) {
            this.forceFieldTimer--;
            if (this.forceFieldTimer <= 0) {
                this.hasForceField = false;
            }
        }

        // Update EMP timer
        if (this.isEMPed) {
            this.empTimer--;
            if (this.empTimer <= 0) {
                this.isEMPed = false;
            }
        }
    }

    resetActions(){
        this.isTurningLeft = false;
        this.isTurningRight = false;
        this.isAccelerating = false;
        this.isDecelerating = false;
        this.isDrifting = false;
        this.useItemRequest = false;
    }

    /**
     * Uses the first item in the racer's items array.
     * This method will be implemented later with specific item behaviors.
     */
    useItem() {
        if(this.items.length > 0 && !this.isEMPed){
            console.log(this.items[0].type);
            let item = this.items.shift();
            Items[item.type].use(this, item);
        }
    }
    
    handleItemCollisions(){
        items.forEach(item => {
            if (this.position.distanceTo(item.position) < item.collisionRadius + this.collisionRadius) {
                Items[item.type].collision(this, item);
            }
        });
    }

    reverseControls(){
        if (this.controlsReversed){
            let t = this.isTurningLeft;
            this.isTurningLeft = this.isTurningRight;
            this.isTurningRight = t;
            t = this.isAccelerating;
            this.isAccelerating = this.isDecelerating;
            this.isDecelerating = t;
        }
    }

    updateCheckpoints(){
        p.beginPath();
        tracks[trackNr - 1].checkpoints[this.checkpoints].path(p);
        if (p.isPointInPath(this.position.x - racers[0].position.x + canvas.width / 2, this.position.y - racers[0].position.y + canvas.height / 2)) {
            this.checkpoints++;
            if (this.checkpoints >= tracks[trackNr - 1].checkpoints.length) {
                this.checkpoints = 0;//Finished lap
                this.currentLap++;
                if (this.currentLap > tracks[trackNr - 1].laps) {
                    //Finished race
                }
            }
        }
    }
}
