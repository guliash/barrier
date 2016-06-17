var _types;
function main() {
    localize();
    get(host + '/types', function(responseText) {
        _types = JSON.parse(responseText);
        restore_options();
    }, function(error) {

    });
}

function restore_options() {
    chrome.storage.sync.get({
        time: 5,
        urls: []
    }, render);
}

function localize() {
    document.getElementById('barrier_time_label').textContent = chrome.i18n.getMessage("options_time_label");
    document.getElementById('barrier_add').textContent = chrome.i18n.getMessage("options_add_button");
    document.getElementById('barrier_save').textContent = chrome.i18n.getMessage("options_save_button");
}

function render(items) {
    document.getElementById('barrier_time').value = items.time;
    for(var i = 0; i < items.urls.length; i++) {
        add_url(items.urls[i]);
    }
}

function save_options() {
    var time = getTime();
    var urls = getUrls();
    chrome.storage.sync.set({
        time: time,
        urls: urls
    }, function() {
        var status = document.getElementById('barrier_status');
        status.textContent = chrome.i18n.getMessage("options_saved");
        setTimeout(function() {
            status.textContent = '';
        }, 2000);
  });
}

function getTime() {
    var time_input = document.getElementById('barrier_time');
    return time_input.value;
}

function getUrls() {
    var urls = [];
    var urls_div = document.getElementById('barrier_urls');
    for(var i = 0; i < urls_div.childNodes.length; i++) {
        var child = urls_div.childNodes[i];
        var input = child.children[0];
        var select = child.children[1];
        urls.push({domain: input.value, type: select.value});
    }
    return urls;
}

function add_url(item) {
    var div = _createElement('div');
    var domain_input = _createElement('input');
    domain_input.type = 'text';
    domain_input.placeholder = chrome.i18n.getMessage("options_site_placeholder");
    var type_select = _createElement('select');
    var remove_btn = _createElement('button');
    remove_btn.innerHTML = chrome.i18n.getMessage("options_delete_site_button");
    var selectedIndex = 0;
    for(var i = 0; i < _types.length; i++) {
        var option = _createElement('option');
        option.value = _types[i].type;
        option.text = _types[i].type;
        type_select.appendChild(option);
        if(item.type.type == _types[i].type) {
            selectedIndex = i;
        }
    }
    domain_input.value = item.domain;
    type_select.selectedIndex = selectedIndex;
    div.appendChild(domain_input);
    div.appendChild(type_select);
    div.appendChild(remove_btn);
    remove_btn.addEventListener('click', function() {
        document.getElementById('barrier_urls').removeChild(div);
    });
    document.getElementById('barrier_urls').appendChild(div);
}

document.addEventListener('DOMContentLoaded', main);

document.getElementById('barrier_save').addEventListener('click', save_options);
document.getElementById('barrier_add').addEventListener('click', function() {
    add_url({type: _types[0], domain: ''});
});
