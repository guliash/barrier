function restore_options() {
    chrome.storage.sync.get({
        time: 5
    }, function(items) {
        document.getElementById('time').value = items.time;
    });
}

function save_options() {
    var time_input = document.getElementById('time');
    var time = time_input.value;
    chrome.storage.sync.set({
        time: time,
    }, function() {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 2000);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);

document.getElementById('save').addEventListener('click', save_options);
