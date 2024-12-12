

function getRandomItem(placement=1, bans) {
    let currentWeights = JSON.parse(JSON.stringify(itemWeights[placement]));
    for (let i = 0; i < bans.length; i++) {
        currentWeights[bans[i]] = 0;
    }
    let totalWeight = Object.values(currentWeights).reduce((a, b) => a + b, 0);
    Object.keys(currentWeights).forEach((key) => currentWeights[key] = currentWeights[key] / totalWeight);
    let random = Math.random();
    for (let i = 0; i < Object.keys(currentWeights).length; i++) {
        if (random < currentWeights[Object.keys(currentWeights)[i]]) {
            return Object.keys(currentWeights)[i];
        } else {
            random -= currentWeights[Object.keys(currentWeights)[i]];
        }
    }
}