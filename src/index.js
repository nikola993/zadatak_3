const config = require('./config.js');

const startCordinates = [config.startCordinate.x, config.startCordinate.y];
const endCordinates = [config.endCordinate.x, config.endCordinate.y];
const size = config.gridSize;

const STATUS = {
    VALID: 'Valid',
    INVALID: 'Invalid',
    BLOCKED: 'Blocked',
    EMPTY: 'Empty',
    GOAL: 'Goal',
    OBSTACLE: 'Obstacle',
    UNKNOWN: 'Unknown',
    VISITED: 'Visited',
    START: 'Start',
};

const DIRECTIONS = {
    UP: 'Up',
    RIGHT: 'Right',
    DOWN: 'Down',
    LEFT: 'Left',
};

// Proveri status lokacije i vrati 'Valid', 'Invalid', 'Blocked', or 'Goal'
function locationStatus(location, grid) {
    const gridSize = grid.length;
    const dft = location.distanceFromTop;
    const dfl = location.distanceFromLeft;

    if (location.distanceFromLeft < 0 || location.distanceFromLeft >= gridSize
        || location.distanceFromTop < 0 || location.distanceFromTop >= gridSize) {
        // lokacija je izvan matrice
        return STATUS.INVALID;
    }
    if (grid[dft][dfl] === STATUS.GOAL) {
        return STATUS.GOAL;
    }
    if (grid[dft][dfl] !== STATUS.EMPTY) {
        // lokacija je ili block ili je vec posecena
        return STATUS.BLOCKED;
    }
    return STATUS.VALID;
}

// Proveri matricu od date lokacije ka datom smeru
function exploreInDirection(currentLocation, direction, grid) {
    const newPath = currentLocation.path.slice();
    newPath.push(direction);

    let dft = currentLocation.distanceFromTop;
    let dfl = currentLocation.distanceFromLeft;

    const newCorinates = currentLocation.cordinates.slice();
    newCorinates.push([dfl, dft]);

    if (direction === DIRECTIONS.UP) {
        dft -= 1;
    } else if (direction === DIRECTIONS.RIGHT) {
        dfl += 1;
    } else if (direction === DIRECTIONS.DOWN) {
        dft += 1;
    } else if (direction === DIRECTIONS.LEFT) {
        dfl -= 1;
    }

    const newLocation = {
        distanceFromTop: dft,
        distanceFromLeft: dfl,
        path: newPath,
        cordinates: newCorinates,
        status: STATUS.UNKNOWN,
    };
    newLocation.status = locationStatus(newLocation, grid);

    // Ako je lokacija valida oznaci je kao 'Visited'
    if (newLocation.status === STATUS.VALID) {
        grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = STATUS.VISITED;
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
        status: STATUS.START,
    };

    // Kreiranje reda sa pocetnom lokacijom
    const queue = [location];
    // Prolazak kroz matrice u potrazi za izlazom
    while (queue.length > 0) {
        // Uzima prvu lokaciju iz reda
        const currentLocation = queue.shift();

        const directions = [DIRECTIONS.UP, DIRECTIONS.RIGHT, DIRECTIONS.DOWN, DIRECTIONS.LEFT];
        for (let i = 0; i < directions.length; i += 1) {
            const newLocation = exploreInDirection(currentLocation, directions[i], grid);
            if (newLocation.status === STATUS.GOAL) {
                newLocation.cordinates.shift();
                newLocation.cordinates.push(endCordinates);
                return newLocation.cordinates;
            }
            if (newLocation.status === STATUS.VALID) {
                queue.push(newLocation);
            }
        }
    }
    // Ne posoji putanja
    return false;
}

function revertVisited(grid, gridSize) { // vracanje Visited polja u Empty za sledecu proveru
    const newGrid = grid;
    for (let i = 0; i < gridSize; i += 1) {
        for (let j = 0; j < gridSize; j += 1) {
            if (newGrid[i][j] === STATUS.VISITED) {
                newGrid[i][j] = STATUS.EMPTY;
            }
        }
    }
    return newGrid;
}

function createObstacles(grid, gridSize, start) { // vracanje matrice sa blokovima
    let newGrid = grid;
    const numberOfObstacles = config.blocks;
    for (let i = 0; i < numberOfObstacles; i += 1) {
        let blockIsCreated = false;
        while (!blockIsCreated) { // ponavljanje dok se ne kreira odgovarajuci block
            const x = Math.floor(Math.random() * (gridSize));
            const y = Math.floor(Math.random() * (gridSize));
            const isStartPosition = (start[0] === x && start[1] === y);

            if (newGrid[x][y] === STATUS.EMPTY && !(isStartPosition)) { // ako je random kordinata prazno polje i nije start
                newGrid[x][y] = STATUS.OBSTACLE;
                const checkPath = findShortestPath(start, newGrid);
                newGrid = revertVisited(newGrid, gridSize);
                if (!checkPath) { // provera da li postoji putanja
                    newGrid[x][y] = STATUS.EMPTY; // vraca polje u prazno ako ne postoji putanja
                } else {
                    blockIsCreated = true;
                }
            }
        }
    }
    return newGrid;
}
// Kreiranje matrice

function createGrid(gridSize) {
    const grid = [];
    for (let i = 0; i < gridSize; i += 1) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j += 1) {
            grid[i][j] = STATUS.EMPTY;
        }
    }
    grid[endCordinates[1]][endCordinates[0]] = STATUS.GOAL;
    const gridWithObstacles = createObstacles(grid, size, startCordinates);
    return gridWithObstacles;
}

const grid = createGrid(size);
console.log(grid);
console.log(findShortestPath(startCordinates, grid));
