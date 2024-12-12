function loadTrack(track){
    trackNr = tracks.indexOf(track)+1;
    
    // Load item boxes
    track.itemBoxes.forEach(element => {
        items.push(new Item("itemBox", new Point(element.position.x * track.scale, element.position.y * track.scale), null, null, 0, new Point(0, 0), 0));
    });
    
    // Load other items (like nitro crystals)
    track.items.forEach(element => {
        items.push(new Item(element.type, new Point(element.position.x * track.scale, element.position.y * track.scale), element.target, element.owner, element.duration, element.velocity, element.delay));
    });
    
    racers = track.racers;
    racers.forEach(function(racer){racer.position = new Point(racer.position.x * track.scale, racer.position.y * track.scale); placements.push(racers.indexOf(racer));});
}