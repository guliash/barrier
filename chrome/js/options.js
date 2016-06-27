var _types;

var portStorage = chrome.runtime.connect({ name: 'storage' });
var portApi = chrome.runtime.connect({ name: 'api' });

portStorage.onMessage.addListener(function(msg) {
    switch(msg.type) {
        case 'save':
            onDataSaved();
            break;
        case 'get':
            render(msg.data);
            break;
    }
});

portApi.onMessage.addListener(function(msg) {
    console.log('api');
    console.log(msg);
    switch(msg.method) {
        case 'types':
            onGetTypes(msg);
            break;
    }
});

function main() {
    localize();
    portApi.postMessage({ method: 'types' });
}

function onGetTypes(result) {
    if(result.success) {
        _types = result.data;
        restoreOptions();
    }
}

function restoreOptions() {
    portStorage.postMessage({ type: 'get' });
}

function _createElement() {
    var el = document.createElement(arguments[0]);
    if(arguments.length > 1) {
        for(var i = 1; i < arguments.length; i++) {
            el.className += ' ' + arguments[i];
        }
    }
    return el;
}

function localize() {
    document.title = chrome.i18n.getMessage('options_title');
    document.getElementById('barrier-time-label').textContent = chrome.i18n.getMessage("options_time_label");
    document.getElementById('barrier-add').textContent = chrome.i18n.getMessage("options_add_button");
    document.getElementById('barrier-save').textContent = chrome.i18n.getMessage("options_save_button");
    document.getElementById('barrier-homepage').innerHTML = chrome.i18n.getMessage("homepage");
}

function render(items) {
    document.getElementById('barrier-time').value = items.time;
    for(var i = 0; i < items.blockedSites.length; i++) {
        addBlockedSite(items.blockedSites[i]);
    }
}

function onDataSaved() {
    var status = document.getElementById('barrier-status');
    status.textContent = chrome.i18n.getMessage("options_saved");
    setTimeout(function() {
        status.textContent = '';
    }, 2000);
}

function saveOptions() {
    portStorage.postMessage({ type: 'save', data: { time: getTime(), blockedSites: getBlockedSites() } });
}

function getTime() {
    var timeInput = document.getElementById('barrier-time');
    return timeInput.value;
}

function getBlockedSites() {
    var blockedSites = [];
    var sitesDiv = document.getElementById('barrier-sites');
    for(var i = 0; i < sitesDiv.childNodes.length; i++) {
        var child = sitesDiv.childNodes[i];
        var input = child.children[0];
        var select = child.children[1];
        blockedSites.push({domain: input.value, type: select.value,
            lastClosed: undefined});
    }
    return blockedSites;
}

function addBlockedSite(item) {
    var div = _createElement('div', 'barrier-blocked-site');
    var domainInput = _createElement('input');
    domainInput.type = 'text';
    domainInput.placeholder = chrome.i18n.getMessage("options_site_placeholder");
    var typeSelect = _createElement('select');
    var removeBtn = _createElement('button');
    removeBtn.innerHTML = chrome.i18n.getMessage("options_delete_site_button");
    var selectedIndex = 0;
    for(var i = 0; i < _types.length; i++) {
        var option = _createElement('option');
        option.value = _types[i].type;
        option.text = _types[i].type;
        typeSelect.appendChild(option);
        if(item.type == _types[i].type) {
            selectedIndex = i;
        }
    }
    domainInput.value = item.domain;
    typeSelect.selectedIndex = selectedIndex;
    div.appendChild(domainInput);
    div.appendChild(typeSelect);
    div.appendChild(removeBtn);
    removeBtn.addEventListener('click', function() {
        document.getElementById('barrier-sites').removeChild(div);
    });
    document.getElementById('barrier-sites').appendChild(div);
}

document.addEventListener('DOMContentLoaded', main);

document.getElementById('barrier-save').addEventListener('click', saveOptions);
document.getElementById('barrier-add').addEventListener('click', function() {
    addBlockedSite({type: _types[0], domain: ''});
});
