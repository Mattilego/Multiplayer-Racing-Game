function resetFrame(){
    racers[0].accellerating = false;
    racers[0].deaccellerating = false;
    racers[0].turningLeft = false;
    racers[0].turningRight = false;
    racers[0].drifting = false;
}

function update(){
    resetFrame();
    checkControls();
    racers.forEach(function(racer){racer.update();});
    items.forEach(function(item){
        Items[item.type].update(item);
    });
    itemBoxes.forEach(function(itemBox){
        Items[itemBox.type].update(item);
    });
    items = items.filter(function(item){return !item.delete;});
    //Update placements
    let racersSorted = [...racers].sort((a, b) => {console.log(a.currentLap, b.currentLap, a.checkpoints, b.checkpoints);return (a.currentLap === b.currentLap)? b.checkpoints - a.checkpoints: b.currentLap - a.currentLap});
    placements = racersSorted.map(racer => racer.id);
}