// CONFIG (tunable constants) ---------------------------------------
// Versioned, runtime-mutable in sandbox mode. Normal mode uses defaults.
var config = {
    schemaVersion: 1,
    basic: {
        clipperCost: 5,
        wireCost: 20,
        adCost: 100,
        factoryCost: 100000000,
        harvesterCost: 1000000,
        wireDroneCost: 1000000,
        farmCost: 10000000,
        batteryCost: 1000000,
        megaClipperCost: 500,
        probeCost: 100000000,
        clipperBoost: 0.25,
        marketingLvlStart: 1,
        demandStart: 5,
        marginStart: 0.25
    },
    advanced: {
        factoryBoost: 1,
        droneBoost: 1,
        clipperBoostLvl2: 0.25,
        wireSupply: 1000,
        farmRate: 50,
        batterySize: 10000,
        factoryPowerRate: 200,
        dronePowerRate: 1,
        giftPeriod: 125000,
        synchCost: 5000,
        threnodyCost: 50000,
        entertainCost: 10000
    }
};

// Bounds for sandbox editing
var configBounds = {
    basic: {
        clipperCost: { min: 1, max: 1000 },
        wireCost: { min: 1, max: 1000 },
        adCost: { min: 1, max: 10000 },
        factoryCost: { min: 1000, max: 1000000000 },
        harvesterCost: { min: 1000, max: 100000000 },
        wireDroneCost: { min: 1000, max: 100000000 },
        farmCost: { min: 1000, max: 1000000000 },
        batteryCost: { min: 1000, max: 100000000 },
        megaClipperCost: { min: 1, max: 100000 },
        probeCost: { min: 1000, max: 1000000000 },
        clipperBoost: { min: 0.01, max: 5 },
        marketingLvlStart: { min: 1, max: 10 },
        demandStart: { min: 1, max: 100 },
        marginStart: { min: 0.01, max: 10 }
    },
    advanced: {
        factoryBoost: { min: 0.1, max: 10 },
        droneBoost: { min: 0.1, max: 10 },
        clipperBoostLvl2: { min: 0.01, max: 5 },
        wireSupply: { min: 1, max: 100000 },
        farmRate: { min: 1, max: 10000 },
        batterySize: { min: 1, max: 1000000 },
        factoryPowerRate: { min: 1, max: 10000 },
        dronePowerRate: { min: 0.1, max: 100 },
        giftPeriod: { min: 1000, max: 1000000 },
        synchCost: { min: 1, max: 100000 },
        threnodyCost: { min: 1, max: 1000000 },
        entertainCost: { min: 1, max: 100000 }
    }
};

// Defaults snapshot for reset
var configDefaults = JSON.parse(JSON.stringify(config));

// Map config path -> global variable name (for live apply in sandbox)
var configToGlobal = {
    'basic.clipperCost': 'clipperCost',
    'basic.wireCost': 'wireCost',
    'basic.adCost': 'adCost',
    'basic.marginStart': 'margin',
    'basic.demandStart': 'demand',
    'basic.marketingLvlStart': 'marketingLvl',
    'basic.megaClipperCost': 'megaClipperCost',
    'basic.factoryCost': 'factoryCost',
    'basic.harvesterCost': 'harvesterCost',
    'basic.wireDroneCost': 'wireDroneCost',
    'basic.farmCost': 'farmCost',
    'basic.batteryCost': 'batteryCost',
    'advanced.wireSupply': 'wireSupply',
    'advanced.farmRate': 'farmRate',
    'advanced.batterySize': 'batterySize',
    'advanced.factoryPowerRate': 'factoryPowerRate',
    'advanced.dronePowerRate': 'dronePowerRate',
    'advanced.giftPeriod': 'giftPeriod',
    'advanced.synchCost': 'synchCost',
    'advanced.threnodyCost': 'threnodyCost',
    'advanced.entertainCost': 'entertainCost'
};

// Live-apply: update the backing global when a config value changes
var _origSetCfg = setCfg;
setCfg = function(path, val) {
    var ok = _origSetCfg(path, val);
    if (ok && configToGlobal[path]) {
        window[configToGlobal[path]] = cfg(path);
    }
    return ok;
};

// Migration shim
if (!config.schemaVersion) { config.schemaVersion = 1; }

// Helper: get a config value by path string "basic.clipperCost"
function cfg(path) {
    var parts = path.split('.');
    var cur = config;
    for (var i = 0; i < parts.length; i++) { cur = cur[parts[i]]; }
    return cur;
}

// Helper: set a config value (sandbox use), clamped
function setCfg(path, val) {
    var parts = path.split('.');
    var cur = config;
    for (var i = 0; i < parts.length - 1; i++) { cur = cur[parts[i]]; }
    var key = parts[parts.length - 1];
    var bounds = configBounds;
    for (var i = 0; i < parts.length - 1; i++) { bounds = bounds[parts[i]]; }
    bounds = bounds[key];
    var num = Number(val);
    if (isNaN(num)) return false;
    if (bounds) {
        if (num < bounds.min) num = bounds.min;
        if (num > bounds.max) num = bounds.max;
    }
    cur[key] = num;
    return true;
}

// Helper: reset one constant to default
function resetCfg(path) {
    var parts = path.split('.');
    var cur = config; var def = configDefaults;
    for (var i = 0; i < parts.length - 1; i++) { cur = cur[parts[i]]; def = def[parts[i]]; }
    cur[parts[parts.length-1]] = def[parts[parts.length-1]];
}

// Helper: is value modified from default?
function isCfgModified(path) {
    var parts = path.split('.');
    var cur = config; var def = configDefaults;
    for (var i = 0; i < parts.length; i++) { cur = cur[parts[i]]; def = def[parts[i]]; }
    return cur !== def;
}

// Merge saved sandbox config at load (sandbox mode only)
(function() {
    if (typeof window === 'undefined') return;
    var isSb = false;
    try { isSb = (sessionStorage.getItem('upMode') === 'sandbox'); } catch(e) {}
    if (!isSb) return;
    var raw = null;
    try { raw = localStorage.getItem('sandboxConfig'); } catch(e) {}
    if (!raw) return;
    try {
        var saved = JSON.parse(raw);
        for (var tier in saved) {
            if (tier === 'schemaVersion') continue;
            if (config[tier]) {
                for (var k in saved[tier]) {
                    setCfg(tier + '.' + k, saved[tier][k]);
                }
            }
        }
    } catch(e) {}
})();