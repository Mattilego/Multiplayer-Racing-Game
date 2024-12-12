if(typeof io !== "undefined"){
// Multiplayer networking code
let socket;
let clientId;
let gameRoom;
let lastStateUpdate = 0;
let serverTimeOffset = 0;
let localRacerId = null; // Store our racer's ID
let itemOverrideSupressions = [];

// Track item and effect changes
let lastItemState = null;
let lastEffectState = null;

// Debug logging
function debug(event, data) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${event}:`, data);
}

// Initialize multiplayer connection
function initMultiplayer() {
    socket = io();
    
    socket.on('connect', () => {
        clientId = socket.id;
        debug('Connected to server', { clientId });
    });

    // Handle game state updates
    socket.on('gameStateUpdate', (gameState) => {
        // Initialize local racer ID if not set
        if (!localRacerId) {
            const localRacerData = gameState.racers.find(r => r.id === clientId);
            if (localRacerData) {
                localRacerId = localRacerData.id;
                debug('Local racer initialized', { 
                    id: localRacerId,
                    position: localRacerData.position
                });
                // Create our local racer
                const localRacer = new Racer();
                Object.assign(localRacer, localRacerData);
                // Reinitialize position and velocity as Point objects
                if (localRacerData.position) {
                    localRacer.position = new Point(localRacerData.position.x, localRacerData.position.y);
                }
                if (localRacerData.velocity) {
                    localRacer.velocity = new Point(localRacerData.velocity.x, localRacerData.velocity.y);
                }
                localRacer.isPlayer = true;
                racers.push(localRacer);
            }
        }

        // Update timestamp
        updateDelay = Date.now() - lastStateUpdate;
        lastStateUpdate = Date.now();
        serverTimeOffset = lastStateUpdate - gameState.timestamp;

        // Update or create non-local racers
        gameState.racers.forEach(racerData => {
            if (racerData.id !== localRacerId) {
                let racer = racers.find(r => r.id === racerData.id);
                if (!racer) {
                    // Create new racer
                    racer = new Racer(racerData.topSpeed, racerData.maxReverseSpeed, racerData.acceleration, racerData.handling, racerData.driftThreshold, racerData.collisionRadius, undefined, new Point(racerData.position.x, racerData.position.y), racerData.angle, false, racerData.id);
                    // Reinitialize position and velocity as Point objects
                    if (racerData.position) {
                        racer.position = new Point(racerData.position.x, racerData.position.y);
                    }
                    if (racerData.velocity) {
                        racer.velocity = new Point(racerData.velocity.x, racerData.velocity.y);
                    }
                    racer.hasForceField = racerData.hasForceField;
                    racer.isEMPed = racerData.isEMPed;
                    racer.forceFieldTimer = racerData.forceFieldTimer;
                    racer.empTimer = racerData.empTimer;
                    racers.push(racer);
                } else {
                    // Update existing racer
                    Object.assign(racer, racerData);
                    // Reinitialize position and velocity as Point objects
                    if (racerData.position) {
                        racer.position = new Point(racerData.position.x, racerData.position.y);
                    }
                    if (racerData.velocity) {
                        racer.velocity = new Point(racerData.velocity.x, racerData.velocity.y);
                    }
                }
            }
        });

        itemOverrideSupressions.forEach(supression => {
            if (gameState.items.find(item => item.id === supression)){
                gameState.items = gameState.items.filter(item => item.id !== supression);
                gameState.items.push(items.find(item => item.id === supression));
            } else{
                supression = null;
            }
        });
        itemOverrideSupressions = itemOverrideSupressions.filter(supression => supression !== null);

        // Update items
        items = gameState.items.map(itemData => {
            const item = new Item(
                itemData.type,
                new Point(itemData.position.x, itemData.position.y),
                itemData.target,
                itemData.ownerId,
                itemData.duration,
                new Point(itemData.velocity?.x || 0, itemData.velocity?.y || 0),
                itemData.direction,
                itemData.state
            );
            item.id = itemData.id;
            return item;
        });

        // Remove disconnected racers while preserving local racer
        const oldRacerCount = racers.length;
        racers = racers.filter(racer => {
            if (racer.id === localRacerId) return true;
            return gameState.racers.some(r => r.id === racer.id);
        });
        if (oldRacerCount !== racers.length) {
            debug('Removed disconnected racers', { 
                before: oldRacerCount, 
                after: racers.length 
            });
        }

        // Make sure our local racer is still in the array
        if (localRacerId && !racers.find(r => r.id === localRacerId)) {
            const localRacer = new Racer();
            Object.assign(localRacer, gameState.racers.find(r => r.id === localRacerId));
            localRacer.isPlayer = true;
            racers.push(localRacer);
            debug('Restored local racer', { 
                id: localRacer.id,
                position: localRacer.position
            });
        }
    });

    // Handle game start
    socket.on('gameStart', (racers) => {
        debug('Game started', { racerCount: racers.length });
        gameStarted = true;
    });

    // Handle new player joining
    socket.on('playerJoined', (data) => {
        debug('Player joined', { 
            playerId: data.id,
            roomId: data.roomId,
            totalPlayers: data.racers.length
        });
        gameRoom = data.roomId;
    });

    // Handle player disconnection
    socket.on('playerLeft', (playerId) => {
        if (playerId !== localRacerId) {
            racers = racers.filter(racer => racer.id !== playerId);
            debug('Player left', { 
                playerId,
                remainingPlayers: racers.length 
            });
        }
    });
}
initMultiplayer();

// Update function to be called in the game loop
function updateMultiplayer() {
    if (!socket || !gameRoom || !localRacerId) return;

    // Find local racer by ID
    const localRacer = racers.find(r => r.id === localRacerId);
    if (!localRacer) {
        debug('Local racer not found', { localRacerId });
        return;
    }

    // Basic state that's always sent
    const updateData = {
        roomId: gameRoom,
        id: localRacerId,
        position: localRacer.position,
        angle: localRacer.angle,
        currentLap: localRacer.currentLap,
        speed: localRacer.speed,
        drifting: localRacer.drifting,
        driftAngle: localRacer.driftAngle,
        hasForceField: localRacer.hasForceField,
        isEMPed: localRacer.isEMPed,
        forcefieldTimer: localRacer.forceFieldTimer,
        empTimer: localRacer.empTimer,
        state: localRacer.state
    };

    // Only send items if they've changed
    const currentItemState = JSON.stringify(localRacer.items);
    if (currentItemState !== lastItemState) {
        updateData.items = localRacer.items;
        lastItemState = currentItemState;
    }

    // Send update to server
    socket.emit('playerUpdate', updateData);
}

// Send item event to server
function useItem(item) {
    if (!socket || !gameRoom) return;
    
    socket.emit('itemEvent', {
        roomId: gameRoom,
        item: item
    });
}
function updateItemData(itemId, dataToUpdate) {
    if (!socket || !gameRoom) return;
    
    itemOverrideSupressions.push(itemId);
    setTimeout((id) => {
        itemOverrideSupressions = itemOverrideSupressions.filter(supression => supression !== id); 
    }, updateDelay*4, itemId);

    socket.emit('itemUpdate', {
        roomId: gameRoom,
        itemId: itemId,
        dataToUpdate: dataToUpdate
    });
}

// Monkey patch Racer's useItem method to sync with server
const originalUseItem = Racer.prototype.useItem;
Racer.prototype.useItem = function() {
    if (this.items.length > 0 && !this.isEMPed) {
        const item = this.items[0];
        // Call original method
        originalUseItem.call(this);
        // Sync with server if this is the local player
        if (this.isPlayer && Items[item.type].type === "object") {
            useItem(items.at(-1));
        }
    }
};
}