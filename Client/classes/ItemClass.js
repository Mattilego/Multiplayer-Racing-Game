class Item{
    constructor(type = "bananaPeel", position = new Point(), targetId = null, ownerId = null, duration = 240, velocity = new Point(), direction = 0, state = {}){
        this.type = type;
        this.position = position;
        this.targetId = targetId;
        this.ownerId = ownerId;  
        this.duration = duration;
        this.velocity = velocity;
        this.direction = direction;
        this.delete = false;
        this.collisionRadius = Items[type].collisionRadius;
        this.state = state;
        this.id = Math.random();
    }

    // Helper method to get owner racer object
    getOwner() {
        if (!this.ownerId) return null;
        return racers.find(r => r.id === this.ownerId);
    }
}