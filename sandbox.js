// SANDBOX (config editor) ------------------------------------------
function renderSandbox() {
    if (!window.upSandbox) return;
    var panel = document.getElementById('sandboxPanel');
    if (panel) panel.style.display = 'block';
    var basic = document.getElementById('sandboxBasic');
    var advanced = document.getElementById('sandboxAdvanced');
    if (!basic || !advanced) return;
    basic.innerHTML = '';
    advanced.innerHTML = '';
    function makeRow(container, tier, key) {
        var row = document.createElement('div');
        row.style.margin = '4px 0';
        var lbl = document.createElement('label');
        lbl.textContent = tier + '.' + key + ' ';
        row.appendChild(lbl);
        var inp = document.createElement('input');
        inp.type = 'number';
        inp.value = config[tier][key];
        inp.style.width = '80px';
        inp.onchange = function() {
            var ok = setCfg(tier + '.' + key, inp.value);
            if (ok) {
                inp.value = cfg(tier + '.' + key);
                if (isCfgModified(tier + '.' + key)) {
                    inp.style.backgroundColor = '#fff3cd';
                } else {
                    inp.style.backgroundColor = '';
                }
            }
        };
        row.appendChild(inp);
        var btn = document.createElement('button');
        btn.textContent = 'reset';
        btn.style.marginLeft = '4px';
        btn.onclick = function() {
            resetCfg(tier + '.' + key);
            inp.value = cfg(tier + '.' + key);
            inp.style.backgroundColor = '';
        };
        row.appendChild(btn);
        container.appendChild(row);
    }
    for (var k in config.basic) { makeRow(basic, 'basic', k); }
    for (var k in config.advanced) { makeRow(advanced, 'advanced', k); }
}

function saveSandboxConfig() {
    if (!window.upSandbox) return;
    localStorage.setItem('sandboxConfig', JSON.stringify(config));
    alert('Sandbox config saved.');
}

function loadSandboxConfig() {
    if (!window.upSandbox) return;
    var raw = localStorage.getItem('sandboxConfig');
    if (!raw) return;
    if (!confirm('Load saved sandbox config?')) return;
    try {
        var saved = JSON.parse(raw);
        // merge saved values into config (with bounds)
        for (var tier in saved) {
            if (tier === 'schemaVersion') continue;
            if (config[tier]) {
                for (var k in saved[tier]) {
                    setCfg(tier + '.' + k, saved[tier][k]);
                }
            }
        }
        renderSandbox();
        alert('Sandbox config loaded.');
    } catch (e) {
        alert('Failed to load sandbox config.');
    }
}

function resetAllSandbox() {
    config = JSON.parse(JSON.stringify(configDefaults));
    renderSandbox();
    alert('All sandbox values reset to defaults.');
}

// init sandbox after DOM ready
(function() {
    if (window.upSandbox) {
        setTimeout(function(){ renderSandbox(); loadSandboxConfig(); }, 500);
    }
})();