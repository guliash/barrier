

function getStoragePortListener(port) {
    return function(msg) {
        console.log('storage');
        console.log(msg);
        if(msg.type == 'save') {
            saveData(msg.data, function() {
                port.postMessage({ success: true, type: msg.type });
            });
        } else if(msg.type == 'get') {
            getData(function(data) {
                port.postMessage({ data: data, success: true, type: msg.type });
            });
        } else {
            port.postMessage({ success: false, type: msg.type });
        }
    }
}

function getApiPortListener(port) {
    return function(msg) {
        console.log('api');
        console.log(msg);
        var url;
        var params = [];
        switch(msg.method) {
            case 'quotes':
                url = host + '/quotes';
                break;
            case 'types':
                url = host + '/types';
                break;
        }
        if(url) {
            if(msg.params) {
                url += '?' + buildParams(msg.params);
            }
            get(url, function(responseText) {
                port.postMessage({ success: true, data: JSON.parse(responseText), method: msg.method });
            }, function(error) {
                port.postMessage({ success: false, method: msg.method });
            });
        }
    }
}

function get(url, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if(xhr.readyState != 4) {
            return;
        }
        if(xhr.status != 200) {
            error({status: xhr.status, statusText: xhr.statusText});
        } else {
            success(xhr.responseText);
        }
    }
}

function buildParams(params) {
    var result = '';
    if(params) {
        for(var i = 0; i < params.length; i++) {
            result += params[i][0] + "=" + params[i][1];
            if(i != params.length - 1) {
                result += '&';
            }
        }
    }
    return result;
}

function saveData(dataToSave, callback) {
    chrome.storage.sync.get({
        time: 5,
        blockedSites: []
    }, function(currentData) {
        mergeTimes(currentData, dataToSave);
        mergeBlockedSites(currentData, dataToSave);
        save(dataToSave, callback);
    });
}

function mergeTimes(currentData, dataToSave) {
    if(dataToSave.time === undefined) {
        dataToSave.time = currentData.time;
    }
}

function mergeBlockedSites(currentData, dataToSave) {
    if(!dataToSave.blockedSites) {
        return;
    }
    for(var i = 0; i < dataToSave.blockedSites.length; i++) {
        var site = dataToSave.blockedSites[i];
        if(site.lastClosed === undefined && currentData.blockedSites) {
            for(var i = 0; i < currentData.blockedSites.length; i++) {
                var curSite = currentData.blockedSites[i];
                if(curSite.domain == site.domain) {
                    site.lastClosed = curSite.lastClosed;
                }
            }
        }
    }
}

function save(data, callback) {
    var fieldsToDelete = [];
    if(data.time === null) {
        fieldsToDelete.push('time');
    }
    if(data.blockedSites === null) {
        fieldsToDelete.push('blockedSites');
    }
    if(fieldsToDelete.length != 0) {
        chrome.storage.sync.remove(fieldsToDelete, function() {
            for(var i = 0; i < fieldsToDelete.length; i++) {
                data[fieldsToDelete[i]] = undefined;
            }
            chrome.storage.sync.set(data, function() {
                callback();
            })
        });
    } else {
        chrome.storage.sync.set(data, function() {
            callback();
        })
    }
}

function getData(callback) {
    chrome.storage.sync.get({
        time: 5,
        blockedSites: []
    }, callback);
}

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    console.log('on push');
    chrome.tabs.executeScript(details.tabId, { file: "js/content_script.js" });

});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log('on changed');
    console.log(changes);
    console.log(namespace);
});

chrome.runtime.onConnect.addListener(function(port) {
    if(port.name == 'storage') {
        port.onMessage.addListener(getStoragePortListener(port));
    } else if(port.name == 'api') {
        port.onMessage.addListener(getApiPortListener(port));
    }
});
