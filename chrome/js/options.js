var _types;

function main() {
    localize();
    get(host + '/types', function(responseText) {
        _types = JSON.parse(responseText);
        restoreOptions();
    }, function(error) {

    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        time: 5,
        blockedSites: []
    }, function(items) {
        render(items);
    });
}

function localize() {
    document.getElementById('barrier-time-label').textContent = chrome.i18n.getMessage("options_time_label");
    document.getElementById('barrier-add').textContent = chrome.i18n.getMessage("options_add_button");
    document.getElementById('barrier-save').textContent = chrome.i18n.getMessage("options_save_button");
}

function render(items) {
    document.getElementById('barrier-time').value = items.time;
    for(var i = 0; i < items.blockedSites.length; i++) {
        addBlockedSite(items.blockedSites[i]);
    }
}

function saveOptions() {
    chrome.storage.sync.set({
        time: getTime(),
        blockedSites: getBlockedSites()
    }, function() {
        var status = document.getElementById('barrier-status');
        status.textContent = chrome.i18n.getMessage("options_saved");
        setTimeout(function() {
            status.textContent = '';
        }, 2000);
  });
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
            lastClosed: child.barrier.data.lastClosed});
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
    div.barrier = {};
    div.barrier.data = {lastClosed: item.lastClosed};
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
