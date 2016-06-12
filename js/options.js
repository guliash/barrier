function restore_options() {
    chrome.storage.sync.get({
        time: 5,
        urls: []
    }, render);
}

function render(items) {
    document.getElementById('time').value = items.time;
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
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 2000);
  });
}

function getTime() {
    var time_input = document.getElementById('time');
    return time_input.value;
}

function getUrls() {
    var urls = [];
    var urls_div = document.getElementById('urls');
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
    domain_input.placeholder = 'domain';
    var type_select = _createElement('select');
    var remove_btn = _createElement('button');
    remove_btn.innerHTML = 'Delete';
    var selectedIndex = 0;
    for(var i = 0; i < types.length; i++) {
        var option = _createElement('option');
        option.value = types[i];
        option.text = types[i];
        type_select.appendChild(option);
        if(item.type == types[i]) {
            selectedIndex = i;
        }
    }
    domain_input.value = item.domain;
    type_select.selectedIndex = selectedIndex;
    div.appendChild(domain_input);
    div.appendChild(type_select);
    div.appendChild(remove_btn);
    remove_btn.addEventListener('click', function() {
        document.getElementById('urls').removeChild(div);
    });
    document.getElementById('urls').appendChild(div);
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', save_options);
document.getElementById('add').addEventListener('click', function() {
    add_url({type: types[0], domain: ''});
});
