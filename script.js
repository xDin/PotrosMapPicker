let maps = ["Ascent", "Bind", "Icebox", "Lotus", "Sunset", "Haven", "Abyss"];
let results = [];
let teamA = "Equipo A";
let teamB = "Equipo B";
let history = [];
let sidePickers = []; // Store which team gets to pick the side for each map
let sideDecisions = 0; // Track the number of side decisions
function setTeams() {
    teamA = document.getElementById('team_a').value;
    teamB = document.getElementById('team_b').value;
    renderMapButtons();
    updateTurnIndicator();
}

function renderMapButtons(disabled = false) {
    const mapButtonsDiv = document.getElementById('map-buttons');
    mapButtonsDiv.innerHTML = '';
    maps.forEach(map => {
        const button = document.createElement('button');
        button.className = 'map-button';
        button.disabled = disabled;
        button.onclick = () => selectMap(map);
        button.innerHTML = `<span>${map}</span>`;
        button.style.backgroundImage = `url('${map}.webp')`;
        mapButtonsDiv.appendChild(button);
    });
}

function selectMap(map) {
    let action, displayAction;
    if (results.length == 0) {
        action = `Ban - Turno de ${teamA}`;
        displayAction = `Ban - ${teamA}`;
    } else if (results.length == 1) {
        action = `Ban - Turno de ${teamB}`;
        displayAction = `Ban - ${teamB}`;
    } else if (results.length == 2) {
        action = `Pick - Turno de ${teamA}`;
        displayAction = `Pick - ${teamA}`;
        sidePickers.push(teamB); // Team B picks the side for this map
    } else if (results.length == 3) {
        action = `Pick - Turno de ${teamB}`;
        displayAction = `Pick - ${teamB}`;
        sidePickers.push(teamA); // Team A picks the side for this map
    } else if (results.length == 4) {
        action = `Ban - Turno de ${teamB}`;
        displayAction = `Ban - ${teamB}`;
    } else if (results.length == 5) {
        action = `Ban - Turno de ${teamA}`;
        displayAction = `Ban - ${teamA}`;
    } else if (results.length == 6) {
        action = 'Mapa Decisor';
        displayAction = 'Mapa Decisor';
        sidePickers.push(teamA); // Assuming team A picks the side for the decider
    }
    results.push({ action, displayAction, map, picker: sidePickers[results.length - 2] });
    history.push({ action, map, maps: [...maps] });
    maps = maps.filter(m => m !== map);
    renderResults();
    renderMapButtons();
    updateTurnIndicator();
}

function undoLast() {
    if (history.length > 0) {
        const last = history.pop();
        results = results.filter(r => r.map !== last.map);
        maps = last.maps;

        // Check if the last action was a side pick
        if (last.action.includes('Lado')) {
            sideDecisions--;
            sidePickers.pop();
        } else if (last.action.includes('Pick') || last.action === 'Mapa Decisor') {
            sidePickers.pop();

            // Check if the action before the last one was a side pick
            if (history.length > 0 && history[history.length - 1].action.includes('Lado')) {
                const previous = history.pop();
                results = results.filter(r => r.map !== previous.map);
                maps = previous.maps;
                sideDecisions--;
            }
        }

        renderResults();
        renderMapButtons();
        updateTurnIndicator();
    }
}

function updateTurnIndicator() {
    const turnIndicator = document.getElementById('turn-indicator');
    const turns = [
        `Ban - Turno de ${teamA}`, `Ban - Turno de ${teamB}`, 
        `Pick - Turno de ${teamA}`, `Lado - ${teamB} elige lado`, 
        `Pick - Turno de ${teamB}`, `Lado - ${teamA} elige lado`,
        `Ban - Turno de ${teamB}`, `Ban - Turno de ${teamA}`,
        `Mapa Decisor`, `Lado - ${teamA} elige lado`
    ];
    const turnIndex = results.length + sideDecisions;
    if (turnIndex < turns.length) {
        turnIndicator.textContent = `${turns[turnIndex]}`;
        if (turns[turnIndex].includes('Ban')) {
            turnIndicator.style.color = '#ff6347'; // Red for ban
        } else if (turns[turnIndex].includes('Pick')) {
            turnIndicator.style.color = '#1e90ff'; // Blue for pick
        } else if (turns[turnIndex].includes('Lado')) {
            turnIndicator.style.color = '#32CD32'; // Green for side pick
            renderMapButtons(true); // Disable map buttons
        } else if (turns[turnIndex] === 'Mapa Decisor') {
            turnIndicator.style.color = '#bbbb1f'; // Yellow for decider
        }
    } else {
        turnIndicator.textContent = `Completado`;
        turnIndicator.style.color = '#bbbb1f'; // Yellow for completed
    }
}

function renderResults() {
    const selectedMapsList = document.getElementById('selected-maps-list');
    selectedMapsList.innerHTML = '';
    results.forEach((result, index) => {
        const mapCardContainer = document.createElement('div');
        mapCardContainer.className = 'map-card-container';

        const mapCard = document.createElement('div');
        mapCard.className = 'map-card';
        mapCard.style.backgroundImage = `url('${result.map}.webp')`;
        if (result.action.includes('Ban')) {
            mapCard.classList.add('ban');
        } else if (result.action.includes('Pick') || result.action === 'Mapa Decisor') {
            mapCard.classList.add(result.action.includes('Pick') ? 'pick' : 'decider');
        }
        
        const info = document.createElement('div');
        info.className = 'info';
        info.innerHTML = `${result.displayAction}<br>${result.map}`;
        mapCard.appendChild(info);
        mapCardContainer.appendChild(mapCard);

        if (result.action.includes('Pick') || result.action === 'Mapa Decisor') {
            if (!result.side) {
                const sidePickButtons = document.createElement('div');
                sidePickButtons.className = 'side-pick-buttons';
                const attackButton = document.createElement('button');
                attackButton.className = 'side-pick-button';
                attackButton.textContent = 'Ataque';
                attackButton.onclick = () => pickSide(index, 'Ataque');
                const defenseButton = document.createElement('button');
                defenseButton.className = 'side-pick-button';
                defenseButton.textContent = 'Defensa';
                defenseButton.onclick = () => pickSide(index, 'Defensa');
                sidePickButtons.appendChild(attackButton);
                sidePickButtons.appendChild(defenseButton);
                mapCardContainer.appendChild(sidePickButtons);
            } else {
                const sideCard = document.createElement('div');
                sideCard.className = 'side-card';
                const picker = result.picker ? result.picker : (result.side === 'atacar' ? teamB : teamA);
                sideCard.textContent = `${picker} decidió ${result.side}`;
                mapCardContainer.appendChild(sideCard);
            }
        }

        selectedMapsList.appendChild(mapCardContainer);
    });
}

function pickSide(index, side) {
    results[index].side = side === 'Ataque' ? 'atacar' : 'defender';
    sideDecisions++; // Increment side decisions count
    history.push({ action: `Lado - ${results[index].picker} elige lado`, map: results[index].map, maps: [...maps] }); // Register the side pick
    renderResults();
    updateTurnIndicator(); // Move to the next turn after picking the side
    renderMapButtons(false); // Enable map buttons
}

renderMapButtons();
updateTurnIndicator();
