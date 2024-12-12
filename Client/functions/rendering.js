function setCameraToRacer(id = 0){
    p.resetTransform();
    p.translate(canvas.width/2, canvas.height/2);
    p.scale(zoom, zoom);
    p.translate(-racers[id].position.x, -racers[id].position.y);
}

function render(track, racers, items, itemBoxes){
    p.fillStyle = track.background;
    p.resetTransform();
    p.setTransform(1, 0, 0, 1, 0, 0);
    p.fillRect(0, 0, canvas.width, canvas.height);
    setCameraToRacer();

    // Calculate screen bounds
    const screenWidth = canvas.width / zoom;
    const screenHeight = canvas.height / zoom;
    const centerX = racers[0].position.x;
    const centerY = racers[0].position.y;
    const halfScreenWidth = screenWidth / 2;
    const halfScreenHeight = screenHeight / 2;

    // Screen bounds for culling
    const screenBounds = {
        left: centerX - halfScreenWidth,
        right: centerX + halfScreenWidth,
        top: centerY - halfScreenHeight,
        bottom: centerY + halfScreenHeight,
        width: screenWidth,
        height: screenHeight,
        centerX: centerX,
        centerY: centerY
    };

    track.draw(p);
    racers.forEach(function(racer){
        racer.draw(p);
    });

    // Render items with culling based on collision radius
    items.forEach(function(item){
        if (Items[item.type] && Items[item.type].draw) {
            // Check if item is within screen bounds + its collision radius
            const padding = item.collisionRadius || 50;
            const isOnScreen = 
                item.position.x > screenBounds.left - padding &&
                item.position.x < screenBounds.right + padding &&
                item.position.y > screenBounds.top - padding &&
                item.position.y < screenBounds.bottom + padding;

            if (isOnScreen) {
                Items[item.type].draw(p, item);
            }
        }
    });

    drawUI(p);
}