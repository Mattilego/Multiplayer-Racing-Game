const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const { createCanvas } = require('canvas');

// Create a canvas context for server-side operations
const canvas = createCanvas(800, 600);
const p = canvas.getContext('2d');

// Debug logging
function debug(event, data) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${event}:`, JSON.stringify(data, null, 2));
}

// Helper function for distance calculations
function distance(p1, p2) {
    return Math.sqrt((p2.x-p1.x)**2 + (p2.y-p1.y)**2);
}

// Create base game context with shared dependencies and classes
const baseGameContext = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Buffer,
    process,
    Math,
    Point: null,    // Will be populated from class files
    Item: null,     // Will be populated from class files
    ItemBox: null,  // Will be populated from class files
    Racer: null,    // Will be populated from class files
    Track: null,    // Will be populated from class files
    Triangle: null, // Will be populated from class files
    GeneralPath: null, // Will be populated from class files
    Arc: null,      // Will be populated from class files
    Shape: null,    // Will be populated from class files
    Items: {},      // Will be populated from Items.js
    tracks: [],     // Will be populated from Tracks.js
    canvas,         // Add canvas to game context
    p,              // Add canvas context to game context
    global: null,   // Will be set to self
    trackNr: 1,     // Default track number
    items: [],      // Room-specific items array
    placements: [], // Room-specific placements array
    racers: new Map(), // Room-specific racers map
    distance: distance, // Add distance function
    loadTrack: function(track) {
        this.trackNr = this.tracks.indexOf(track) + 1;
        debug('Loading track', { trackName: track.name, trackNumber: this.trackNr });
    }
};

// Create the context and set up self-reference
baseGameContext.global = baseGameContext;
vm.createContext(baseGameContext);

// Load all class files in correct order
const clientPath = path.join(__dirname, 'Client');
const classFiles = [
    'classes/ShapesClasses.js',    // Contains Point and basic shapes
    'classes/ItemClass.js',        // Base Item class
    'classes/itemBoxClass.js',     // ItemBox class that extends Item
    'classes/RacerClass.js',       // Racer class
    'classes/TrackClass.js'        // Track class
];

// Load the class files in order
classFiles.forEach(file => {
    const filepath = path.join(clientPath, file);
    const content = fs.readFileSync(filepath, 'utf8');
    try {
        // Wrap class definitions to expose them to game context
        const wrappedContent = `
            (function(exports) {
                ${content}
                if (typeof Point !== 'undefined') exports.Point = Point;
                if (typeof Item !== 'undefined') exports.Item = Item;
                if (typeof ItemBox !== 'undefined') exports.ItemBox = ItemBox;
                if (typeof Racer !== 'undefined') exports.Racer = Racer;
                if (typeof Track !== 'undefined') exports.Track = Track;
                if (typeof Triangle !== 'undefined') exports.Triangle = Triangle;
                if (typeof GeneralPath !== 'undefined') exports.GeneralPath = GeneralPath;
                if (typeof Arc !== 'undefined') exports.Arc = Arc;
                if (typeof Shape !== 'undefined') exports.Shape = Shape;
            })(this);
        `;
        vm.runInContext(wrappedContent, baseGameContext);
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
        throw error;
    }
});

// Load game data files
const dataFiles = [
    'data/Items.js',      // Must be loaded first as other files depend on Items
    'data/CarStats.js',
    'data/ItemDistributions.js',
    'data/StateChanges.js',
    'data/Tracks.js'      // Load tracks last as they depend on Items
];

// Load the data files
dataFiles.forEach(file => {
    const filepath = path.join(clientPath, file);
    const content = fs.readFileSync(filepath, 'utf8');
    try {
        // Wrap data files to expose variables to game context
        const wrappedContent = `
            (function(exports) {
                ${content}
                if (typeof tracks !== 'undefined') exports.tracks = tracks;
                if (typeof Items !== 'undefined') exports.Items = Items;
                if (typeof carStats !== 'undefined') exports.carStats = carStats;
                if (typeof itemDistributions !== 'undefined') exports.itemDistributions = itemDistributions;
                if (typeof stateChanges !== 'undefined') exports.stateChanges = stateChanges;
            })(this);
        `;
        vm.runInContext(wrappedContent, baseGameContext);
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
        throw error;
    }
});

// Create a new game context for a room
function createRoomGameContext() {
    const context = {
        ...baseGameContext,
        items: [],      // Initialize new items array for this room
        placements: [], // Initialize new placements array for this room
        racers: new Map(), // Initialize new racers map for this room
        // Override loadTrack to handle room-specific items
        loadTrack: function(track) {
            // Call base loadTrack to update trackNr
            baseGameContext.loadTrack.call(this, track);
            
            this.items = []; // Clear existing items
            this.placements = []; // Clear existing placements
            
            // Load item boxes
            track.itemBoxes.forEach(element => {
                const itemBox = new this.Item(
                    "itemBox", 
                    new this.Point(element.position.x * track.scale, element.position.y * track.scale),
                    null,
                    null,
                    0,
                    new this.Point(0, 0),
                    0
                );
                this.items.push(itemBox);
            });

            // Load other items (like nitro crystals)
            track.items.forEach(element => {
                const item = new this.Item(
                    element.type,
                    new this.Point(element.position.x * track.scale, element.position.y * track.scale),
                    null,
                    null,
                    0,
                    new this.Point(0, 0),
                    0
                );
                this.items.push(item);
            });
            
            debug('Track loaded', { 
                itemCount: this.items.length,
                itemBoxes: track.itemBoxes.length,
                otherItems: track.items.length
            });
        }
    };
    return context;
}

// Create a new game room
function createGameRoom(roomId) {
    const room = {
        id: roomId,
        gameStarted: false,
        lastUpdate: Date.now(),
        gameContext: createRoomGameContext(),
        update: function(){
            this.gameContext.items.forEach(function(item){
                baseGameContext.Items[item.type].update(item);
            });
            this.gameContext.items = this.gameContext.items.filter(function(item){
                return !item.delete;
            });
        }
    };

    // Initialize track (using first track from tracks array)
    if (baseGameContext.tracks && baseGameContext.tracks.length > 0) {
        debug('Loading initial track', { 
            trackCount: baseGameContext.tracks.length,
            firstTrack: baseGameContext.tracks[0].name 
        });
        room.gameContext.loadTrack(baseGameContext.tracks[0]);
    } else {
        debug('Warning: No tracks available for room', { roomId });
    }

    return room;
}

// Game rooms state
const gameRooms = new Map();
const MAX_PLAYERS_PER_ROOM = 6;

// Find or create a room for a player
function findOrCreateRoom(socket) {
    // Find a room with space
    for (const [roomId, room] of gameRooms) {
        if (room.gameContext.racers.size < MAX_PLAYERS_PER_ROOM) {
            debug('Found existing room', { 
                roomId, 
                players: room.gameContext.racers.size,
                itemCount: room.gameContext.items.length 
            });
            return roomId;
        }
    }
    
    // Create new room if none found
    const roomId = `room_${Date.now()}`;
    const newRoom = createGameRoom(roomId);
    gameRooms.set(roomId, newRoom);
    debug('Created new room', { 
        roomId,
        itemCount: newRoom.gameContext.items.length,
        trackNumber: newRoom.gameContext.trackNr
    });
    return roomId;
}

// Serve static files from Client directory
app.use(express.static(path.join(__dirname, 'Client')));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Client', 'Racing.html'));
});

// Socket connection handling
io.on('connection', (socket) => {
    debug('Player connected', { playerId: socket.id });

    // Handle player joining
    const roomId = findOrCreateRoom(socket);
    socket.join(roomId);
    
    const room = gameRooms.get(roomId);
    
    // Create new racer
    const newRacer = {
        id: socket.id,
        isPlayer: true,
        position: { x: 0, y: 0 },
        angle: 0,
        speed: 0,
        items: [],
        effects: [],
        currentLap: 0,
        drifting: false,
        driftAngle: 0
    };
    
    room.gameContext.racers.set(socket.id, newRacer);
    debug('Player joined room', { 
        roomId, 
        playerId: socket.id, 
        playerCount: room.gameContext.racers.size,
        itemCount: room.gameContext.items.length
    });

    // Notify all players
    io.to(roomId).emit('playerJoined', {
        id: socket.id,
        racers: Array.from(room.gameContext.racers.values()),
        roomId: roomId
    });

    // Start game if enough players
    if (room.gameContext.racers.size >= 2) {
        room.gameStarted = true;
        debug('Starting game', { 
            roomId, 
            playerCount: room.gameContext.racers.size
        });
        io.to(roomId).emit('gameStart', Array.from(room.gameContext.racers.values()));
    }

    // Handle player updates
    socket.on('playerUpdate', (data) => {
        const room = gameRooms.get(data.roomId);
        if (!room || !room.gameContext.racers.has(socket.id)) return;

        // Update racer state
        const racer = room.gameContext.racers.get(socket.id);
        Object.assign(racer, data);
        room.lastUpdate = Date.now();
    });

    // Handle item events
    socket.on('itemEvent', (data) => {
        const room = gameRooms.get(data.roomId);
        if (!room || !room.gameContext.racers.has(socket.id)) return;

        debug('Item event', { 
            roomId: data.roomId, 
            playerId: socket.id,
            itemType: data.item.type,
            itemPosition: data.item.position,
            itemState: data.state,
            ownerId: data.item.ownerId,
            itemId: data.item.id
        });
        const newItem = new room.gameContext.Item(data.item.type, new room.gameContext.Point(data.item.position.x, data.item.position.y), data.item.target, data.item.ownerId, data.item.duration, new room.gameContext.Point(data.item.velocity.x, data.item.velocity.y), data.item.direction, data.item.state);
        newItem.id = data.item.id;
        room.gameContext.items.push(newItem);
    });
    socket.on("itemRemove", (data) => {
        const room = gameRooms.get(data.roomId);
        if (!room || !room.gameContext.racers.has(socket.id)) return;
        room.gameContext.items = room.gameContext.items.filter(item => (item.id != data.itemId));
    })

    // Handle disconnection
    socket.on('disconnect', () => {
        for (const [roomId, room] of gameRooms) {
            if (room.gameContext.racers.has(socket.id)) {
                room.gameContext.racers.delete(socket.id);
                debug('Player left', { 
                    roomId, 
                    playerId: socket.id, 
                    remainingPlayers: room.gameContext.racers.size 
                });
                
                // Notify other players
                io.to(roomId).emit('playerLeft', socket.id);
                
                // Clean up empty rooms
                if (room.gameContext.racers.size === 0) {
                    gameRooms.delete(roomId);
                    debug('Room deleted', { roomId });
                }
                break;
            }
        }
    });
});

// Game state update loop
setInterval(() => {
    const now = Date.now();
    gameRooms.forEach((room, roomId) => {
        if (room.gameStarted && room.gameContext.racers.size > 0) {
            let gameState = {
                racers: [],
                items: []
            };
            for (const [id, racer] of room.gameContext.racers) {
                gameState.racers.push({
                    id: id,
                    position: racer.position,
                    angle: racer.angle,
                    speed: racer.speed,
                    drifting: racer.drifting,
                    currentLap: racer.currentLap,
                    checkpoints: racer.checkpoints,
                    hasForceField: racer.hasForceField,
                    isEMPed: racer.isEMPed,
                    forcefieldTimer: racer.forceFieldTimer,
                    empTimer: racer.empTimer,
                    state: racer.state,
                    collisionRadius: racer.collisionRadius,
                    nitroCrystals: racer.nitroCrystals,
                });
            }
            for (const item of room.gameContext.items){
                gameState.items.push({
                    type: item.type,
                    position: item.position,
                    duration: item.duration,
                    velocity: item.velocity,
                    direction: item.direction,
                    collisionRadius: item.collisionRadius,
                    ownerId: item.ownerId,
                    target: item.target,
                    state: item.state  // Add state to serialized item
                });
            } 
            // Send game state to all players
            io.to(roomId).emit('gameStateUpdate', gameState);
        }
    });
}, 1000/10); // 10 times per second

//Update game state
setInterval(() => {
    gameRooms.forEach((room, roomId) => {
        if (room.gameStarted && room.gameContext.racers.size > 0) {
            room.update();
        }
    });
}, 1000/60);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

http.listen(PORT, HOST, () => {
    console.log('\n=================================================================');
    console.log('🏎️  Racing Game Server Started!');
    console.log('=================================================================');
    console.log('🌐 Local URL:     http://localhost:' + PORT);
    console.log('🌍 Network URL:   http://' + require('os').networkInterfaces()['Wi-Fi']?.find(ip => ip.family === 'IPv4')?.address + ':' + PORT);
    console.log('=================================================================');
    console.log('Waiting for tunnel URL...');
    console.log('=================================================================\n');
});