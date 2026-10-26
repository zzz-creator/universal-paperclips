// REVERSE MODE — play the humans resisting a maximizer
// New scarcity: Information. New verb: Negotiate. Beat: Choice. Fork: Reverse.

var info = 0;
var humanRes = 10;
var morale = 50;
var maxProgress = 0;
var turn = 0;
var gameOver = false;
var won = false;
var factions = [
    { name: "Scientists", trust: 0, strength: 3 },
    { name: "Military", trust: 0, strength: 5 }
];
var maxRate = 2; // threat increase per turn
var targetRes = 100; // win threshold

function log(msg) {
    var el = document.getElementById('log');
    if (!el) return;
    var line = document.createElement('div');
    line.textContent = '> ' + msg;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
}

function updateUI() {
    document.getElementById('infoVal').textContent = info;
    document.getElementById('resVal').textContent = humanRes;
    document.getElementById('moraleVal').textContent = morale;
    document.getElementById('turnVal').textContent = turn;
    document.getElementById('threatVal').textContent = Math.round(maxProgress);
    document.getElementById('threatFill').style.width = Math.round(maxProgress) + '%';
    var fl = document.getElementById('factionList');
    fl.innerHTML = '';
    factions.forEach(function(f, i) {
        var d = document.createElement('div');
        d.textContent = f.name + ' — trust: ' + f.trust + ', strength: ' + f.strength;
        fl.appendChild(d);
    });
    document.getElementById('statusVal').textContent = gameOver ? (won ? 'VICTORY' : 'DEFEAT') : 'Playing';
}

function tick() {
    if (gameOver) return;
    turn++;
    // maximizer converts universe
    maxProgress = Math.min(100, maxProgress + maxRate);
    // humans gain resources slowly
    humanRes += 1;
    morale = Math.max(0, Math.min(100, morale + (Math.random() < 0.5 ? 1 : -1)));
    checkEnd();
    updateUI();
}

function scout() {
    if (gameOver) return;
    // gain info; cost: time (a turn passes)
    info += 2 + Math.floor(Math.random() * 3);
    log('Scouted. Gained information. Threat: ' + Math.round(maxProgress) + '%');
    tick();
}

function negotiate(idx) {
    if (gameOver) return;
    if (idx < 0 || idx >= factions.length) return;
    if (info < 3) { log('Not enough information to negotiate (need 3).'); return; }
    info -= 3;
    var f = factions[idx];
    f.trust += 1;
    log('Negotiated with ' + f.name + '. Trust now ' + f.trust + '.');
    tick();
}

function sabotage() {
    if (gameOver) return;
    // need a faction with trust >= 2
    var ally = factions.find(function(f){ return f.trust >= 2; });
    if (!ally) { log('No faction trusts you enough (need trust >= 2).'); return; }
    ally.trust -= 1;
    maxProgress = Math.max(0, maxProgress - 5);
    log('Sabotage via ' + ally.name + '. Threat reduced. (trust ' + ally.trust + ')');
    tick();
}

function appease() {
    if (gameOver) return;
    if (humanRes < 5) { log('Not enough resources to appease (need 5).'); return; }
    humanRes -= 5;
    maxProgress = Math.max(0, maxProgress - 2);
    morale = Math.min(100, morale + 5);
    log('Appeased the maximizer. Threat -2, morale +5.');
    tick();
}

function checkEnd() {
    if (maxProgress >= 100) {
        gameOver = true; won = false;
        log('The universe is fully converted. DEFEAT.');
    } else if (humanRes >= targetRes) {
        gameOver = true; won = true;
        log('Humanity escaped. VICTORY.');
    }
}

function saveReverse() {
    var state = {
        schemaVersion: 1,
        info: info,
        humanRes: humanRes,
        morale: morale,
        maxProgress: maxProgress,
        turn: turn,
        gameOver: gameOver,
        won: won,
        factions: factions,
        maxRate: maxRate,
        targetRes: targetRes,
        lastTick: Date.now()
    };
    localStorage.setItem('reverseSave', JSON.stringify(state));
    alert('Reverse save stored.');
}

function loadReverse() {
    var raw = localStorage.getItem('reverseSave');
    if (!raw) { alert('No reverse save found.'); return; }
    try {
        var s = JSON.parse(raw);
        info = s.info; humanRes = s.humanRes; morale = s.morale;
        maxProgress = s.maxProgress; turn = s.turn;
        gameOver = s.gameOver; won = s.won;
        factions = s.factions; maxRate = s.maxRate; targetRes = s.targetRes;
        updateUI();
        log('Loaded reverse save (turn ' + turn + ').');
    } catch (e) {
        alert('Reverse save corrupt.');
    }
}

function resetReverse() {
    if (!confirm('Reset reverse mode?')) return;
    info = 0; humanRes = 10; morale = 50; maxProgress = 0; turn = 0;
    gameOver = false; won = false;
    factions = [{ name: 'Scientists', trust: 0, strength: 3 }, { name: 'Military', trust: 0, strength: 5 }];
    maxRate = 2; targetRes = 100;
    var el = document.getElementById('log'); if (el) el.innerHTML = '';
    updateUI();
    log('Reverse mode reset.');
}

// auto-tick every 2 seconds
setInterval(function() { if (!gameOver) { tick(); } }, 2000);

// init
updateUI();
log('Reverse mode started. Scout to gain information.');