function drawUI(p){
    p.save();
    p.setTransform(1, 0, 0, 1, 0, 0);
    
    // Cached values to reduce repeated calculations
    const player = racers[0];
    const baseSpeed = Math.abs(player.speed);
    const baseTopSpeed = player.topSpeed;
    const nitroCrystals = player.nitroCrystals;
    
    // Memoize speed calculations
    const totalSpeed = baseSpeed * (1 + nitroCrystals * 0.02);
    const displaySpeed = Math.round(totalSpeed * 10);
    const totalTopSpeed = baseTopSpeed * (1 + nitroCrystals * 0.02);
    const displayTopSpeed = Math.round(totalTopSpeed * 10);
    
    // Precompute common values
    const boostThreshold = displayTopSpeed * 1.1;
    const placement = placements.indexOf(0) + 1;
    
    // Cached colors and styles
    const bgColor = "rgba(0, 0, 0, 0.5)";
    const slotSize = 40;
    const padding = 10;
    const startX = padding;
    const startY = padding;
    
    // Batch drawing operations
    p.fillStyle = bgColor;
    
    // Item slots background
    p.fillRect(
        startX - padding, 
        startY - padding, 
        (slotSize + padding) * 3 + padding * 2, 
        slotSize + padding * 2
    );
    
    // Optimize item slot rendering
    for(let i = 0; i < 3; i++) {
        const itemSlotX = startX + i * (slotSize + padding);
        
        // Background slot
        p.fillStyle = "#333333";
        p.strokeStyle = "#666666";
        p.lineWidth = 2;
        p.beginPath();
        p.rect(itemSlotX, startY, slotSize, slotSize);
        p.fill();
        p.stroke();
        
        // Optimize item icon drawing
        const item = player.items[i];
        if (item) {
            p.save();
            p.translate(
                itemSlotX + slotSize/2,
                startY + slotSize/2
            );
            Items[item.type].icon.draw(p);
            p.restore();
        }
    }
    
    // Speedometer section
    const speedX = canvas.width - 100;
    const speedY = canvas.height - 40;
    
    // Background for speedometer
    p.fillStyle = bgColor;
    p.fillRect(
        speedX - 90, 
        speedY - 30,
        160,
        65
    );
    
    // Optimize text rendering
    p.font = "bold 24px Arial";
    p.textAlign = "right";
    p.fillStyle = "#FFFFFF";
    
    // Placement
    p.fillText(placement + getOrdinalSuffix(placement), speedX - 50, speedY);
    
    // Speed rendering with optimized boost effect
    if (displaySpeed > boostThreshold) {
        const pulseTime = Date.now() / 100;
        const pulseIntensity = (Math.sin(pulseTime) + 1) / 2;
        
        p.fillStyle = `rgba(255, ${Math.round(150 + pulseIntensity * 105)}, 0, ${0.5 + pulseIntensity * 0.5})`;
        p.shadowColor = "#FF6600";
        p.shadowBlur = 10;
        p.fillText(displaySpeed, speedX + 60, speedY);
        
        p.fillStyle = "#FFDD00";
        p.shadowBlur = 0;
        p.fillText(displaySpeed, speedX + 60, speedY);
    } else {
        p.fillStyle = "#FFFFFF";
        p.fillText(displaySpeed, speedX + 60, speedY);
    }
    
    // KM/H label
    p.font = "12px Arial";
    p.fillStyle = "#FFFFFF";
    p.fillText("KM/H", speedX + 60, speedY + 15);
    
    // Speed bar with optimized rendering
    const barWidth = 80;
    const barHeight = 4;
    
    p.fillStyle = "#333333";
    p.fillRect(speedX - 20, speedY + 20, barWidth, barHeight);
    
    let speedRatio = displaySpeed / displayTopSpeed;
    
    // Simplified gradient and boost effect
    const gradient = p.createLinearGradient(speedX - 20, 0, speedX - 20 + barWidth, 0);
    gradient.addColorStop(0, "#00FF00");
    gradient.addColorStop(0.6, "#FFFF00");
    gradient.addColorStop(1, "#FF0000");
    
    if (displaySpeed > boostThreshold) {
        speedRatio = 1 + 0.1 * ((Math.sin(Date.now() / 100) + 1) / 2);
        p.shadowColor = "#FF6600";
        p.shadowBlur = 5;
    }
    
    p.fillStyle = gradient;
    p.fillRect(speedX - 20, speedY + 20, barWidth * Math.min(speedRatio, 1.2), barHeight);
    p.shadowBlur = 0;
    
    // Lap and crystal section
    const lapX = padding;
    const lapY = canvas.height - padding;
    
    p.fillStyle = bgColor;
    p.fillRect(
        lapX - padding,
        lapY - 60,
        100,
        65
    );
    
    p.font = "bold 24px Arial";
    p.fillStyle = "#FFFFFF";
    p.textAlign = "left";
    p.fillText(`LAP ${player.currentLap}`, lapX, lapY - 35);
    
    // Crystal icon and count
    p.save();
    p.translate(lapX + 10, lapY - 10);
    Items["nitroCrystal"].icon.draw(p);
    p.restore();
    
    p.fillStyle = "#4169E1";
    p.font = "bold 20px Arial";
    p.fillText(`× ${nitroCrystals}`, lapX + 35, lapY - 5);
    
    // Simplified minimap rendering
    const minimapSize = 150;
    const minimapX = canvas.width - minimapSize - padding;
    const minimapY = padding;
    
    p.fillStyle = bgColor;
    p.fillRect(
        minimapX - padding,
        minimapY - padding,
        minimapSize + padding * 2,
        minimapSize + padding * 2
    );
    
    p.save();
    p.translate(minimapX, minimapY);
    
    const track = tracks[0];
    const trackBounds = track.getBounds();
    const scale = Math.min(minimapSize / trackBounds.width, minimapSize / trackBounds.height) * 0.9;
    
    p.translate(
        minimapSize/2 - (trackBounds.x + trackBounds.width/2) * scale,
        minimapSize/2 - (trackBounds.y + trackBounds.height/2) * scale
    );
    p.scale(scale, scale);
    
    // Simplified track rendering
    p.fillStyle = track.background;
    p.fillRect(
        trackBounds.x - trackBounds.width * 0.05,
        trackBounds.y - trackBounds.height * 0.05,
        trackBounds.width * 1.1,
        trackBounds.height * 1.1
    );
    
    p.globalAlpha = 0.7;
    track.visual.draw(p);
    p.globalAlpha = 1;
    
    // Simplified racer rendering
    racers.forEach(racer => {
        // Direct coordinate calculation without save/restore
        const x = racer.position.x / track.scale;
        const y = racer.position.y / track.scale;
        const size = 10/scale;
        
        // Precalculate rotated coordinates
        const cosAngle = Math.cos(racer.angle);
        const sinAngle = Math.sin(racer.angle);
        
        const x1 = x + size * cosAngle;
        const y1 = y + size * sinAngle;
        
        const x2 = x + (-size/2) * cosAngle - (-size/2) * sinAngle;
        const y2 = y + (-size/2) * sinAngle + (-size/2) * cosAngle;
        
        const x3 = x + (-size/2) * cosAngle - (size/2) * sinAngle;
        const y3 = y + (-size/2) * sinAngle + (size/2) * cosAngle;
        
        // Draw triangle
        p.fillStyle = racer.isPlayer ? "#FFFFFF" : "#FF0000";
        p.strokeStyle = "#000000";
        p.lineWidth = 1/scale;
        
        p.beginPath();
        p.moveTo(x1, y1);
        p.lineTo(x2, y2);
        p.lineTo(x3, y3);
        p.closePath();
        p.fill();
        p.stroke();
    });

    p.restore();
    
    if(typeof updateDelay === 'number') {
        p.fillStyle = 'black';
        p.font = '16px Arial';
        p.fillText(`Update Delay: ${updateDelay}`, 10, 100);
    }
    
    p.restore();
}

// Helper function to add ordinal suffix to numbers (1st, 2nd, 3rd, etc.)
function getOrdinalSuffix(number) {
    const j = number % 10;
    const k = number % 100;
    if (j == 1 && k != 11) {
        return "st";
    }
    if (j == 2 && k != 12) {
        return "nd";
    }
    if (j == 3 && k != 13) {
        return "rd";
    }
    return "th";
}