const config = require('./config.js');

const startCordinates = [config.startCordinate.x, config.startCordinate.y];
const endCordinates = [config.endCordinate.x, config.endCordinate.y];
const size = config.gridSize;

// Proveri status lokacije i vrati 'Valid', 'Invalid', 'Blocked', or 'Goal'
function locationStatus(location, grid) {
    const gridSize = grid.length;
    const dft = location.distanceFromTop;
    const dfl = location.distanceFromLeft;

    if (location.distanceFromLeft < 0 || location.distanceFromLeft >= gridSize
        || location.distanceFromTop < 0 || location.distanceFromTop >= gridSize) {
        // lokacija je izvan matrice
        return 'Invalid';
    }
    if (grid[dft][dfl] === 'Goal') {
        return 'Goal';
    }
    if (grid[dft][dfl] !== 'Empty') {
        // lokacija je ili block ili je vec posecena
        return 'Blocked';
    }
    return 'Valid';
}

// Proveri matricu od date lokacije ka datom smeru
function exploreInDirection(currentLocation, direction, grid) {
    const newPath = currentLocation.path.slice();
    newPath.push(direction);

    let dft = currentLocation.distanceFromTop;
    let dfl = currentLocation.distanceFromLeft;

    const newCorinates = currentLocation.cordinates.slice();
    newCorinates.push([dfl, dft]);

    if (direction === 'Up') {
        dft -= 1;
    } else if (direction === 'Right') {
        dfl += 1;
    } else if (direction === 'Down') {
        dft += 1;
    } else if (direction === 'Left') {
        dfl -= 1;
    }

    const newLocation = {
        distanceFromTop: dft,
        distanceFromLeft: dfl,
        path: newPath,
        cordinates: newCorinates,
        status: 'Unknown',
    };
    newLocation.status = locationStatus(newLocation, grid);

    // Ako je lokacija valida oznaci je kao 'Visited'
    if (newLocation.status === 'Valid') {
        grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
    }
    return newLocation;
}

function findShortestPath(startCoordinates, grid) {
    const distanceFromTop = startCoordinates[0];
    const distanceFromLeft = startCoordinates[1];

    // Svaka lokacija cuva svoje kordinate i najkraci put do nje
    const location = {
        distanceFromTop,
        distanceFromLeft,
        path: [],
        cordinates: [],
        status: 'Start',
    };

    // Kreiranje reda sa pocetnom lokacijom
    const queue = [location];
    // Prolazak kroz matrice u potrazi za izlazom
    while (queue.length > 0) {
        // Uzima prvu lokaciju iz reda
        const currentLocation = queue.shift();

        const directions = ['Up', 'Right', 'Down', 'Left'];
        for (let i = 0; i < directions.length; i += 1) {
            const newLocation = exploreInDirection(currentLocation, directions[i], grid);
            if (newLocation.status === 'Goal') {
                newLocation.cordinates.shift();
                newLocation.cordinates.push(endCordinates);
                return newLocation.cordinates;
            }
            if (newLocation.status === 'Valid') {
                queue.push(newLocation);
            }
        }
    }
    // Ne posoji putanja
    return false;
}

function revertVisited(grid, gridSize) { // vracanje Visited polja u Empty za sledecu proveru
    for (let i = 0; i < gridSize; i += 1) {
        for (let j = 0; j < gridSize; j += 1) {
            if (grid[i][j] === 'Visited') {
                grid[i][j] = 'Empty';
            }
        }
    }
    return grid;
}

function createObstacles(grid, gridSize, start) { // vracanje matrice sa blokovima
    const numberOfObstacles = config.blocks;
    for (let i = 0; i < numberOfObstacles; i += 1) {
        let blockIsCreated = false;
        while (!blockIsCreated) { // ponavljanje dok se ne kreira odgovarajuci block
            const x = Math.floor(Math.random() * (gridSize));
            const y = Math.floor(Math.random() * (gridSize));
            const isStartPosition = (start[0] === x && start[1] === y);

            if (grid[x][y] === 'Empty' && !(isStartPosition)) { // ako je random kordinata prazno polje i nije start
                grid[x][y] = 'Obstacle';
                const checkPath = findShortestPath(start, grid);
                revertVisited(grid, gridSize);
                if (!checkPath) { // provera da li postoji putanja
                    grid[x][y] = 'Empty'; // vraca polje u prazno ako ne postoji putanja
                } else {
                    blockIsCreated = true;
                }
            }
        }
    }
    return grid;
}
// Kreiranje matrice

function createGrid(gridSize) {
    const grid = [];
    for (let i = 0; i < gridSize; i += 1) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j += 1) {
            grid[i][j] = 'Empty';
        }
    }
    grid[endCordinates[0]][endCordinates[1]] = 'Goal';
    createObstacles(grid, size, startCordinates);
    return grid;
}
const grid = createGrid(size);
console.log(findShortestPath(startCordinates, grid));
