const Items = {
    "speedBoost": {
        type: "userAffecting",
        name: "Speed Boost",
        description: "Boosts the speed of the racer for a short time.",
        icon: new Shape([
            new GeneralPath([
                new Point(-10, -10),
                new Point(10, 0),
                new Point(-10, 10),
                new Point(-10, -10)
            ], "#FF4444", "#CC0000", 2)
        ]),
        use: function(racer) {
            racer.itemBoostDuration = 60;
        }
    },
    "bananaPeel": {
        type: "object",
        name: "Banana Peel",
        description: "A banana peel that can be put on the track to make other racers spin out.",
        draw: function(p, item){
            p.fillStyle = "yellow";
            p.beginPath();
            p.arc(item.position.x, item.position.y, item.collisionRadius, 0, 2 * Math.PI);
            p.fill();
        },
        icon: new Shape([
            new GeneralPath([
                new Point(-10, -5),
                new Point(-5, 0),
                new Point(0, -5),
                new Point(5, 0),
                new Point(10, -5),
                new Point(0, 5),
                new Point(-10, -5)
            ], "#FFD700", "#B8860B", 2)
        ]),
        collisionRadius: 10,
        use: function(racer) {
            items.push(new Item("bananaPeel", new Point(racer.position.x, racer.position.y), null, racer.id, 500, new Point(-2*Math.cos(racer.angle), -2*Math.sin(racer.angle))));
        },
        update: function(item) {
            item.duration -= 1;
            if (item.duration <= 0) {
                item.delete = true;
            }
            item.position.moveRelative(item.velocity);
            item.velocity.x *= 0.9;
            item.velocity.y *= 0.9;
        },
        collision: function(racer, item) {
            // Don't affect the owner
            if (racer.id === item.ownerId) return;
            
            racer.setState("spun out", 40);
            item.delete = true;
            if (racer === racers[0]){
                updateItemData(item.id, { delete: true });
            }
        }
    },
    "homingMissile": {
        type: "object",
        name: "Homing Missile",
        description: "A homing missile that can be launched to attack the racer in front of the user.",
        icon: new Shape([
            new GeneralPath([
                new Point(-10, -5),
                new Point(10, 0),
                new Point(-10, 5),
                new Point(-5, 0),
                new Point(-10, -5)
            ], "#FF0000", "#8B0000", 2)
        ]),
        draw: function(p, item){
            p.save();
            p.translate(item.position.x, item.position.y);
            p.rotate(item.direction);
            
            // Draw trail
            p.fillStyle = 'rgba(255, 100, 0, 0.7)';
            p.beginPath();
            p.moveTo(0, 0);
            p.lineTo(-item.collisionRadius * 4, item.collisionRadius * 1.5);
            p.lineTo(-item.collisionRadius * 4, -item.collisionRadius * 1.5);
            p.closePath();
            p.fill();
            
            // Add inner glow to trail
            p.fillStyle = 'rgba(255, 255, 0, 0.5)';
            p.beginPath();
            p.moveTo(0, 0);
            p.lineTo(-item.collisionRadius * 2, item.collisionRadius * 0.8);
            p.lineTo(-item.collisionRadius * 2, -item.collisionRadius * 0.8);
            p.closePath();
            p.fill();
            
            // Draw missile body
            p.fillStyle = '#FF0000';
            p.strokeStyle = '#8B0000';
            p.lineWidth = 2;
            p.beginPath();
            p.arc(0, 0, item.collisionRadius, 0, Math.PI * 2);
            p.fill();
            p.stroke();
            
            p.restore();
        },
        collisionRadius: 8,
        use: function(racer) {
            items.push(new Item("homingMissile", new Point(racer.position.x, racer.position.y), racers.find(r => r.id === placements[(placements.indexOf(racer.id) - 1)%racers.length +0/* To convert -0 to 0 */]).id, racer.id, 300, new Point(30*Math.cos(racer.angle), 30*Math.sin(racer.angle)), racer.angle));
        },
        update: function(item) {
            // Delete if duration expires
            item.duration -= 1;
            if (item.duration <= 0) {
                item.delete = true;
                return;
            }

            // Check for wall collision
            const track = typeof window !== 'undefined' ? tracks[trackNr - 1] : tracks[trackNr - 1];
            const context = typeof window !== 'undefined' ? p : p;
            
            context.save();
            context.scale(track.scale, track.scale);
            context.beginPath();
            track.walls.path(context);
            
            // For server-side, we don't need to adjust for camera position
            const checkX = typeof window !== 'undefined' ? 
                item.position.x - racers[0].position.x + canvas.width / 2 :
                item.position.x;
            const checkY = typeof window !== 'undefined' ? 
                item.position.y - racers[0].position.y + canvas.height / 2 :
                item.position.y;
                
            if (context.isPointInPath(checkX, checkY)) {
                item.delete = true;
            }
            context.restore();

            if (item.targetId) {
                let target = racers.find(r => r.id === item.targetId);
                let targetDirection = Math.atan2(target.position.y - item.position.y, target.position.x - item.position.x);
                let currentDirection1 = item.direction;
                let currentDirection2 = item.direction - 2 * Math.PI;
                let difference1 = targetDirection - currentDirection1;
                let difference2 = targetDirection - currentDirection2;
                
                // Get owner's handling for turn rate
                const owner = racers.find(r => r.id === item.ownerId);
                let ownerHandling = (owner) ? owner.handling : 0.2;

                let turnAmount1 = Math.min(Math.abs(difference1), ownerHandling);
                let turnAmount2 = Math.min(Math.abs(difference2), ownerHandling);
                
                if (Math.abs(difference1) < Math.abs(difference2)) {
                    item.direction += turnAmount1*Math.sign(difference1);
                } else {
                    item.direction += turnAmount2*Math.sign(difference2);
                }
            }

            item.velocity = new Point(20*Math.cos(item.direction), 20*Math.sin(item.direction));
            item.position.moveRelative(item.velocity);
        },
        collision: function(racer, item) {
            if (racer.id !== item.ownerId){
                racer.setState("spun out", 80);
                item.delete = true;
                if(racer === racers[0]){
                    updateItemData(item.id, { delete: true });
                }
            }
        }
    },
    "nitroCrystal": {
        type: "collectible",
        name: "Nitro Crystal",
        description: "A crystallized form of racing energy that provides speed boosts and serves as currency.",
        icon: new Shape([
            new Arc(new Point(0, 0), 10, 0, 2 * Math.PI, false, "#4169E1", "#000080", 2)
        ]),
        collisionRadius: 12,
        draw: function(p, item) {
            if (item.duration >= 20) return; // Don't draw if duration is 20 or higher
            
            const scale = 1 - (item.duration / 20); // Scale from 1 to 0 as duration goes from 0 to 20
            
            p.save();
            p.translate(item.position.x, item.position.y);
            p.scale(scale, scale); // Apply scaling
            
            // First rotating hexagon
            p.save();
            p.rotate(performance.now() / 2000); // Slower clockwise rotation
            
            const corners1 = [];
            for(let i = 0; i < 6; i++) {
                corners1.push(new Point(
                    12 * Math.cos(i * Math.PI / 3),
                    12 * Math.sin(i * Math.PI / 3)
                ));
            }
            
            // Draw triangles for first hexagon
            for(let i = 0; i < 6; i++) {
                const c1 = corners1[i];
                const c2 = corners1[(i + 1) % 6];
                const c3 = corners1[(i + 2) % 6];
                
                p.beginPath();
                p.moveTo(c1.x, c1.y);
                p.lineTo(c2.x, c2.y);
                p.lineTo(c3.x, c3.y);
                p.closePath();
                
                p.fillStyle = "rgba(0, 255, 255, 0.3)";
                p.strokeStyle = "rgba(0, 150, 150, 0.8)";
                p.lineWidth = 0.5;
                p.fill();
                p.stroke();
            }
            p.restore();
            
            // Second rotating hexagon
            p.save();
            p.rotate(-performance.now() / 2000); // Slower counter-clockwise rotation
            
            const corners2 = [];
            for(let i = 0; i < 6; i++) {
                corners2.push(new Point(
                    12 * Math.cos(i * Math.PI / 3),
                    12 * Math.sin(i * Math.PI / 3)
                ));
            }
            
            // Draw triangles for second hexagon
            for(let i = 0; i < 6; i++) {
                const c1 = corners2[i];
                const c2 = corners2[(i + 1) % 6];
                const c3 = corners2[(i + 2) % 6];
                
                p.beginPath();
                p.moveTo(c1.x, c1.y);
                p.lineTo(c2.x, c2.y);
                p.lineTo(c3.x, c3.y);
                p.closePath();
                
                p.fillStyle = "rgba(0, 200, 255, 0.3)";
                p.strokeStyle = "rgba(0, 150, 150, 0.8)";
                p.lineWidth = 0.5;
                p.fill();
                p.stroke();
            }
            p.restore();
            
            // Inner core hexagon
            const innerCorners = [];
            for(let i = 0; i < 6; i++) {
                innerCorners.push(new Point(
                    5 * Math.cos(i * Math.PI / 3),
                    5 * Math.sin(i * Math.PI / 3)
                ));
            }
            
            p.beginPath();
            p.moveTo(innerCorners[0].x, innerCorners[0].y);
            for(let i = 1; i < 6; i++) {
                p.lineTo(innerCorners[i].x, innerCorners[i].y);
            }
            p.closePath();
            
            // Pulsing core effect
            const pulseIntensity = (Math.sin(performance.now() / 250) + 1) / 2;
            p.fillStyle = `rgba(255, 255, 255, ${0.5 + pulseIntensity * 0.5})`;
            p.strokeStyle = "rgba(255, 255, 255, 0.8)";
            p.lineWidth = 0.5;
            p.fill();
            p.stroke();
            
            p.restore();
        },
        use: function(racer) {
            racer.nitroCrystals += racer.nitroCrystals < 10;
            racer.itemBoostDuration = 5; // Small speed boost on collection
        },
        update: function(item) {
            item.duration -= (item.duration > 0);
        },
        collision: function(racer, item) {
            if (item.duration > 0) return;
            racer.nitroCrystals += (racer.nitroCrystals < 10);
            item.duration = 400;
            if (racer === racers[0]){
                updateItemData(item.id, { duration: 400 });
            }
        }
    },
    "itemBox": {
        type: "itemBox",
        name: "Item Box",
        description: "A box containing a random item.",
        collisionRadius: 15,
        draw: function(p, item) {
            let t = new Date();
            t = t.getTime()/1000;
            position = new Point(item.position.x, item.position.y + 5*Math.sin(t*Math.PI));
            const size = (item.duration * (item.duration < 0) - item.duration + 40 + item.duration * (item.duration > 40))*(item.duration < 40)/3;
            const g = p.createLinearGradient(position.x - size, position.y - size, position.x + size, position.y + size);
            g.addColorStop(0, `hsla(${200+40*Math.sin(t*4)}, 100%, 80%, 0.5)`);
            g.addColorStop(0.4, `hsla(${200+40*Math.sin(t*4+Math.PI/2)}, 100%, 80%, 0.5)`);
            g.addColorStop(0.6, `hsla(${200+40*Math.sin(t*4+Math.PI)}, 100%, 80%, 0.5)`);
            g.addColorStop(1, `hsla(${200+40*Math.sin(t*4+Math.PI*3/2)}, 100%, 80%, 0.5)`);
            p.fillStyle = g;
            p.moveTo(position.x + size * Math.cos(t), position.y + size * Math.sin(t));
            p.beginPath();
            p.lineTo(position.x + size * Math.cos(t+Math.PI/2), position.y + size * Math.sin(t+Math.PI/2));
            p.lineTo(position.x + size * Math.cos(t+Math.PI), position.y + size * Math.sin(t+Math.PI));
            p.lineTo(position.x + size * Math.cos(t+Math.PI*3/2), position.y + size * Math.sin(t+Math.PI*3/2));
            p.lineTo(position.x + size * Math.cos(t), position.y + size * Math.sin(t));
            p.fill();
            p.fillStyle = "hsla(0, 0%, 90%, 0.3)";
            p.font = "" + size*1.5 + "px Arial";
            p.lineWidth = "2px";
            p.strokeStyle = "hsla(0, 0%, 60%, 0.6)";
            p.strokeText("?", position.x - size*9/20, position.y + size*11/20);
            p.fillText("?", position.x - size*9/20, position.y + size*11/20);
        },
        update: function(item) {
            item.duration -= 1;
        },
        collision: function(racer, item) {
            if (item.duration > 0) return;
            if (racer.items.length < 3){
                racer.items.push(new Item(getRandomItem(placements[racer.id], racer.items.map(item => item.type)), racer.position, null, null, 0, new Point(0, 0), 0));
            }
            item.duration = 100;
            if(racer === racers[0]){
                updateItemData(item.id, { duration: 100 });
            }
        }
    },
    "forceField": {
        type: "userAffecting",
        name: "Force Field",
        description: "Protects the racer from one attack.",
        icon: new Shape([
            new GeneralPath([
                new Arc(new Point(0, 0), 10, 0, 2 * Math.PI),
                new Point(10, -10),
                new Point(10, 10),
                new Point(-10, 10),
                new Point(-10, -10),
                new Point(10, -10)
            ], "#7B68EE", "#483D8B", 2)
        ]),
        use: function(racer) {
            racer.hasForceField = true;
            racer.forceFieldTimer = 300; // 5 seconds at 60fps
        }
    },
    "EMP": {
        type: "object",
        name: "EMP Blast",
        description: "Temporarily disables nearby racers' abilities.",
        icon: new Shape([
            new Arc(new Point(0, 0), 15, 0, 2 * Math.PI, false, "#98FB98", "#228B22", 2)
        ]),
        use: function(racer) {
            const empItem = new Item("EMP", racer.position.copy(), null, racer.id, undefined, new Point((20+racer.speed)*Math.cos(racer.direction), (20+racer.speed)*Math.sin(racer.direction)), racer.angle);
            empItem.state = {detonated: false, detonationTimer: 0, blastRadius: 200};
            
            // Precalculate lightning arc points for better performance
            empItem.state.lightningArcs = [];
            const numArcs = 12; // Reduced from 24
            for (let i = 0; i < numArcs; i++) {
                const arc = [];
                const baseAngle = (i / numArcs) * Math.PI * 2;
                let r = empItem.state.blastRadius * 0.2;
                let angle = baseAngle;
                
                // Create fixed lightning path
                while (r < empItem.state.blastRadius) {
                    r += Math.random() * 20 + 10;
                    angle += (Math.random() - 0.5) * 0.5;
                    arc.push({
                        r: r,
                        angle: angle
                    });
                }
                empItem.state.lightningArcs.push(arc);
            }
            
            items.push(empItem);
        },
        detonate: function(emp) {
            if (!emp.state.detonated) {
                emp.state.detonated = true;
                // Affect all racers in blast radius
                racers.forEach(racer => {
                    if (racer.id !== emp.ownerId && 
                        racer.position.distanceTo(emp.position) <= emp.state.blastRadius) {
                        if (!racer.hasForceField) {
                            racer.isEMPed = true;
                            racer.empTimer = 180; // 3 seconds at 60fps
                        } else {
                            racer.hasForceField = false;
                            racer.forceFieldTimer = 0;
                        }
                    }
                });
            }
        },
        draw: function(p, item) {
            const t = new Date().getTime() / 1000;
            p.save();
            p.translate(item.position.x, item.position.y);
            
            if (item.state.detonated) {
                const progress = item.state.detonationTimer / 15;
                const currentRadius = item.state.blastRadius * progress;
                
                // Outer glow
                const gradient = p.createRadialGradient(0, 0, currentRadius * 0.8, 0, 0, currentRadius);
                gradient.addColorStop(0, `rgba(255, 255, 100, ${0.3 * (1 - progress)})`);
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
                p.fillStyle = gradient;
                p.beginPath();
                p.arc(0, 0, currentRadius, 0, Math.PI * 2);
                p.fill();

                // Main ring
                p.beginPath();
                p.strokeStyle = `rgba(255, 255, 0, ${1 - progress})`;
                p.lineWidth = 4;
                p.arc(0, 0, currentRadius, 0, Math.PI * 2);
                p.stroke();
                
                // Lightning arcs
                p.beginPath();
                p.strokeStyle = `rgba(255, 255, 0, ${(1 - progress) * 0.8})`;
                p.lineWidth = 2;
                
                // Draw 8 lightning bolts
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + t * 2;
                    const innerRadius = currentRadius * 0.3;
                    const outerRadius = currentRadius * 0.9;
                    
                    // Start from inner circle
                    let x = innerRadius * Math.cos(angle);
                    let y = innerRadius * Math.sin(angle);
                    p.moveTo(x, y);
                    
                    // Create 3 segments for each bolt
                    for (let j = 0; j < 3; j++) {
                        const segmentProgress = (j + 1) / 3;
                        const radius = innerRadius + (outerRadius - innerRadius) * segmentProgress;
                        const angleOffset = Math.sin(t * 10 + i + j) * 0.2;
                        x = radius * Math.cos(angle + angleOffset);
                        y = radius * Math.sin(angle + angleOffset);
                        p.lineTo(x, y);
                    }
                }
                p.stroke();
            } else {
                // Core
                p.beginPath();
                p.fillStyle = 'rgba(255, 255, 0, 0.8)';
                p.arc(0, 0, item.collisionRadius * 0.6, 0, Math.PI * 2);
                p.fill();
                
                // Outer glow
                const gradient = p.createRadialGradient(0, 0, item.collisionRadius * 0.3, 0, 0, item.collisionRadius);
                gradient.addColorStop(0, 'rgba(255, 255, 100, 0.4)');
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
                p.fillStyle = gradient;
                p.beginPath();
                p.arc(0, 0, item.collisionRadius, 0, Math.PI * 2);
                p.fill();
                
                // Electric arcs
                p.beginPath();
                p.strokeStyle = 'rgba(255, 255, 0, 0.7)';
                p.lineWidth = 2;
                
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2 + t * 3;
                    const sparkLength = 10 + Math.sin(t * 10 + i) * 5;
                    
                    p.moveTo(
                        item.collisionRadius * 0.6 * Math.cos(angle),
                        item.collisionRadius * 0.6 * Math.sin(angle)
                    );
                    p.lineTo(
                        (item.collisionRadius + sparkLength) * Math.cos(angle + Math.sin(t * 15) * 0.3),
                        (item.collisionRadius + sparkLength) * Math.sin(angle + Math.sin(t * 15) * 0.3)
                    );
                }
                p.stroke();
            }
            
            p.restore();
        },
        collisionRadius: 40,
        update: function(item) {
            if (item.state.detonated) {
                item.state.detonationTimer++;
                if (item.state.detonationTimer >= 15) { // Explosion lasts 15 frames
                    item.delete = true;
                }
            } else {
                item.velocity.x *=0.96; // Increased drag from 0.98 to 0.95
                item.velocity.y *=0.96;
                item.position.moveRelative(item.velocity);
                
                // Remove if too slow
                if (item.velocity.distanceTo(new Point()) < 1) {
                    Items["EMP"].detonate(item);
                }
            }
        },
        collision: function(racer, item) {
            if (!item.state.detonated && racer.id !== item.ownerId) {
                Items["EMP"].detonate(item);
                if(racer === racers[0]){
                    updateItemData(item.id, { velocity: new Point(0, 0) });//Trigger detonation on server
                }
            }
        }
    },
    "teleporter": {
        type: "userAffecting",
        name: "Teleporter",
        description: "Instantly moves the racer a short distance ahead.",
        icon: new Shape([
            new GeneralPath([
                new Point(-10, -10),
                new Point(10, -10),
                new Arc(new Point(10, 0), 10, -Math.PI/2, Math.PI/2),
                new Point(10, 10),
                new Point(-10, 10),
                new Arc(new Point(-10, 0), 10, Math.PI/2, -Math.PI/2)
            ], "#7B68EE", "#483D8B", 2)
        ]),
        use: function(racer) {
            racer.setState("teleporting", 30);
        }
    },
    "boostPad": {
        type: "object",
        name: "Boost Pad",
        description: "Creates a speed boost zone on the track.",
        icon: new Shape([
            new GeneralPath([
                new Point(-15, -5),
                new Point(15, -5),
                new Point(15, 5),
                new Point(-15, 5),
                new Point(-15, -5)
            ], "#FFA500", "#FF8C00", 2)
        ]),
        draw: function(p, item) {
            // Main pad glow effect
            const gradient = p.createRadialGradient(
                item.position.x, item.position.y, 0,
                item.position.x, item.position.y, item.collisionRadius * 1.5
            );
            gradient.addColorStop(0, 'rgba(255, 165, 0, 0.6)');
            gradient.addColorStop(0.6, 'rgba(255, 140, 0, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
            
            p.fillStyle = gradient;
            p.beginPath();
            p.arc(item.position.x, item.position.y, item.collisionRadius * 1.5, 0, 2 * Math.PI);
            p.fill();

            // Inner circle with pulsing effect
            const pulseSize = 1 + Math.sin(Date.now() / 200) * 0.2;
            p.fillStyle = 'rgba(255, 140, 0, 0.7)';
            p.beginPath();
            p.arc(item.position.x, item.position.y, item.collisionRadius * pulseSize, 0, 2 * Math.PI);
            p.fill();

            // Electromagnetic rings effect
            const time = Date.now() / 1000;
            p.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            p.lineWidth = 2;
            
            for (let i = 0; i < 3; i++) {
                const ringPhase = (time * 2 + i * Math.PI / 3) % (Math.PI * 2);
                const ringSize = item.collisionRadius * (0.3 + ringPhase / (Math.PI * 2));
                
                p.beginPath();
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                    const distort = Math.sin(angle * 3 + time * 4) * 0.2;
                    const x = item.position.x + Math.cos(angle) * ringSize * (1 + distort);
                    const y = item.position.y + Math.sin(angle) * ringSize * (1 + distort);
                    
                    if (angle === 0) {
                        p.moveTo(x, y);
                    } else {
                        p.lineTo(x, y);
                    }
                }
                p.closePath();
                p.stroke();
            }

            // Electric arcs
            p.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            p.lineWidth = 1;
            const arcCount = 4;
            for (let i = 0; i < arcCount; i++) {
                const arcPhase = (time * 3 + i * Math.PI / 2) % (Math.PI * 2);
                const arcStart = arcPhase;
                
                p.beginPath();
                p.moveTo(
                    item.position.x + Math.cos(arcStart) * item.collisionRadius * 0.8,
                    item.position.y + Math.sin(arcStart) * item.collisionRadius * 0.8
                );

                for (let j = 1; j <= 3; j++) {
                    const angle = arcStart + (j * Math.PI / 8);
                    const jitter = Math.sin(time * 10 + i + j) * 5;
                    p.lineTo(
                        item.position.x + Math.cos(angle) * item.collisionRadius * 0.8 + jitter,
                        item.position.y + Math.sin(angle) * item.collisionRadius * 0.8 + jitter
                    );
                }
                p.stroke();
            }
        },
        collisionRadius: 20,
        use: function(racer) {
            items.push(new Item("boostPad", new Point(racer.position.x, racer.position.y), null, racer.id, 3000));
        },
        update: function(item) {
            item.duration -= 1;
            if (item.duration <= 0) {
                item.delete = true;
            }
        },
        collision: function(racer, item) {
            racer.itemBoostDuration = 20;
        }
    },
    "fakePowerup": {
        type: "object",
        name: "Fake Item Box",
        description: "Drops a fake item box that looks real but explodes.",
        icon: new Shape([
            new GeneralPath([
                new Point(-10, -10),
                new Point(10, -10),
                new Point(10, 10),
                new Point(-10, 10)
            ], "#FFB6C1", "#FF69B4", 2),
            new Triangle(
                new Point(0, -5),
                new Point(5, 5),
                new Point(-5, 5),
                "#FF1493",
                "#FF1493",
                0
            )
        ]),
        collisionRadius: 15,
        position: new Point(),
        use: function(racer) {
            this.position = new Point(racer.position.x, racer.position.y);
            items.push(new Item("fakePowerup", new Point(racer.position.x, racer.position.y), null, racer.id, 600, new Point(0, 0), 0));
        },
        draw: function(p, item) {
            let t = new Date();
            t = t.getTime()/1000;
            position = new Point(item.position.x, item.position.y + 5*Math.sin(t*Math.PI));
            const size = 40/3;
            const g = p.createLinearGradient(position.x - size, position.y - size, position.x + size, position.y + size);
            g.addColorStop(0, `hsla(${200+40*Math.sin(t*4)}, 100%, 80%, 0.5)`);
            g.addColorStop(0.4, `hsla(${200+40*Math.sin(t*4+Math.PI/2)}, 100%, 80%, 0.5)`);
            g.addColorStop(0.6, `hsla(${200+40*Math.sin(t*4+Math.PI)}, 100%, 80%, 0.5)`);
            g.addColorStop(1, `hsla(${200+40*Math.sin(t*4+Math.PI*3/2)}, 100%, 80%, 0.5)`);
            p.fillStyle = g;
            p.moveTo(position.x + size * Math.cos(t), position.y + size * Math.sin(t));
            p.beginPath();
            p.lineTo(position.x + size * Math.cos(t+Math.PI/2), position.y + size * Math.sin(t+Math.PI/2));
            p.lineTo(position.x + size * Math.cos(t+Math.PI), position.y + size * Math.sin(t+Math.PI));
            p.lineTo(position.x + size * Math.cos(t+Math.PI*3/2), position.y + size * Math.sin(t+Math.PI*3/2));
            p.lineTo(position.x + size * Math.cos(t), position.y + size * Math.sin(t));
            p.fill();
            p.fillStyle = "hsla(0, 0%, 90%, 0.3)";
            p.font = "" + size*1.5 + "px Arial";
            p.lineWidth = "2px";
            p.strokeStyle = "hsla(0, 0%, 60%, 0.6)";
            p.strokeText("?", position.x - size*9/20, position.y + size*11/20);
            p.fillText("?", position.x - size*9/20, position.y + size*11/20);
        },
        update: function(item) {
            item.duration -= 1;
            if (item.duration <= 0) {
                item.delete = true;
            }
        },
        collision: function(racer, item) {
            if (racer.id === item.ownerId) {
                return;
            }
            racer.setState("spun out", 40);
            item.delete = true;
            if(racer === racers[0]) {
                updateItemData(item.id, { delete: true });
            }
        }
    },
    "mirrorControls": {
        type: "object",
        name: "Mirror Ray",
        description: "Fire a ray that temporarily reverses an opponent's controls!",
        icon: new Shape([
            new GeneralPath([
                new Point(-12, 0),
                new Point(12, 0),
                new Point(8, 8),
                new Point(-8, 8)
            ], "#40E0D0", "#20B2AA", 2),
            new GeneralPath([
                new Point(-12, 0),
                new Point(12, 0),
                new Point(8, -8),
                new Point(-8, -8)
            ], "#48D1CC", "#20B2AA", 2)
        ]),
        collisionRadius: 20,
        position: new Point(),
        direction: 0,
        use: function(racer) {
            items.push(new Item("mirrorControls", new Point(racer.position.x, racer.position.y), null, racer.id, 50, new Point(0, 0), racer.angle));
        },
        draw: function(p, item) {
            p.save();
            p.translate(item.position.x, item.position.y);
            p.rotate(item.direction);
            
            // Draw ray effect
            const gradient = p.createLinearGradient(-20, 0, 20, 0);
            gradient.addColorStop(0, "rgba(64, 224, 208, 0)");
            gradient.addColorStop(0.5, "rgba(64, 224, 208, 0.7)");
            gradient.addColorStop(1, "rgba(64, 224, 208, 0)");
            
            p.fillStyle = gradient;
            p.fillRect(-20, -10, 40, 20);
            
            p.restore();
        },
        update: function(item) {
            // Move forward
            item.position.x += Math.cos(item.direction) * 15;
            item.position.y += Math.sin(item.direction) * 15;
            
            // Remove if too far (prevent memory leaks)
            if (item.duration == 0) {
                item.delete = true;
            } else{
                item.duration--;
            }
        },
        collision: function(racer, item) {
            if (racer.id !== item.ownerId) {
                racer.controlsReversed = !racer.controlsReversed;
                racer.controlsReversedTimer = 400;
                item.delete = true;
                if(racer === racers[0]) {
                    updateItemData(item.id, { delete: true });
                }
            }
        }
    },
    "tailwind": {
        type: "object",
        name: "Tailwind",
        description: "Creates a global wind that pushes everyone in your direction.",
        icon: new Shape([
            // Wind arrows effect
            new GeneralPath([
                new Point(-10, -5),
                new Point(0, -5),
                new Point(5, -10),
                new Point(10, -5),
                new Point(0, -5),
                new Point(0, 5),
                new Point(5, 10),
                new Point(10, 5),
                new Point(0, 5),
                new Point(-10, 5)
            ], "#87CEEB", "#B0E0E6", 2)
        ]),
        use: function(racer) {
            items.push(new Item("tailwind", new Point(0, 0), null, racer.id, 300, new Point(0, 0), racer.angle));
        },
        draw: function(p, item) {
            // Draw wind effect directly on screen
            p.save();
            p.setTransform(1, 0, 0, 1, 0, 0);
            
            // Wind parameters
            const windAngle = item.direction;
            const time = performance.now() * 0.001;
            
            // Initialize particles in item if not exists
            if (!item.particles) {
                // Create wind particles
                const particleCount = Math.max(100, Math.floor(canvas.width * canvas.height / 2000));
                item.particles = Array.from({length: particleCount}, () => ({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 5 + 3,
                    phase: Math.random() * Math.PI * 2
                }));
            }
            
            // Draw wind particles
            p.fillStyle = 'rgba(200, 220, 255, 0.8)';
            p.beginPath();
            
            item.particles.forEach(particle => {
                // Move particle in wind direction
                const windSpeed = particle.speed;
                particle.x += Math.cos(windAngle) * windSpeed * 2;
                particle.y += Math.sin(windAngle) * windSpeed * 2;
                
                // Wrap around screen
                if (particle.x < 0) particle.x += canvas.width;
                if (particle.x > canvas.width) particle.x -= canvas.width;
                if (particle.y < 0) particle.y += canvas.height;
                if (particle.y > canvas.height) particle.y -= canvas.height;
                
                // Wavy motion
                const wavyOffset = Math.sin(time * 5 + particle.phase) * 15;
                const perpAngle = windAngle + Math.PI/2;
                
                const wavyX = particle.x + Math.cos(perpAngle) * wavyOffset;
                const wavyY = particle.y + Math.sin(perpAngle) * wavyOffset;
                
                // Draw particle
                p.beginPath(); // Start a new path for each particle
                p.arc(wavyX, wavyY, particle.size, 0, Math.PI * 2);
                p.fill(); // Fill the current particle
            });
            
            // Soft wind overlay
            const gradient = p.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, 'rgba(200, 220, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(200, 220, 255, 0.05)');
            
            p.globalAlpha = 0.2;
            p.fillStyle = gradient;
            p.fillRect(0, 0, canvas.width, canvas.height);
            
            p.globalAlpha = 1;
            p.restore();
        },
        update: function(item) {
            // Apply gentle push to all racers in the wind direction
            racers.forEach(racer => {
                if (!isNaN(item.direction)) {
                    const force = 3;
                    const oldPosition = racer.position.copy();
                    racer.position.moveRelative(new Point(force * Math.cos(item.direction), force * Math.sin(item.direction)));
                    setCameraToRacer();
                    p.scale(tracks[trackNr - 1].scale, tracks[trackNr - 1].scale);
                    p.beginPath();
                    tracks[trackNr - 1].walls.path(p);
                    if (p.isPointInPath(oldPosition.x-racers[0].position.x+canvas.width/2 + 2*force * Math.cos(item.direction), oldPosition.y-racers[0].position.y+canvas.height/2 + 2*force * Math.sin(item.direction))) {
                        racer.position = (oldPosition.copy());
                        racer.position.moveRelative(new Point(-force * Math.cos(item.direction), -force * Math.sin(item.direction)))
                    }
                }
            });
            
            item.duration--;
            if (item.duration <= 0) {
                item.delete = true;
            }
        },
        collision: function(racer, item) {
            return
        },
        collisionRadius: Infinity
    }
    
}