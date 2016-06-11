var currentUrl = window.location.href;

shuffle(quotes);

var body =
'<div class="barrier_sub_container"> \
    <div class="barrier_mid_top_panel"> \
        <div class="barrier_left_column"> \
            <div class="barrier_img_container"> \
            </div> \
        </div> \
        <div class="barrier_mid_column"> \
            <div class="barrier_message_container"> \
                <p class="barrier_message"/> \
            </div> \
        </div> \
        <div class="barrier_right_column"> \
            <div class="barrier_img_container"> \
            </div> \
        </div> \
    </div> \
    <div class="barrier_mid_bottom_panel"> \
    </div> \
</div>';

var main_container = _createElement('div', 'barrier_main_container');

main_container.innerHTML = body;

var left_image = _createElement('img');
var right_image = _createElement('img');
left_image.src = chrome.extension.getURL('images/ic_keyboard_arrow_left_white_48dp_2x.png');
right_image.src = chrome.extension.getURL('images/ic_keyboard_arrow_right_white_48dp_2x.png');

main_container.getElementsByClassName('barrier_left_column')[0].getElementsByClassName('barrier_img_container')[0].appendChild(left_image);

main_container.getElementsByClassName('barrier_right_column')[0].getElementsByClassName('barrier_img_container')[0].appendChild(right_image);

function _createElement() {
    var el = document.createElement(arguments[0]);
    if(arguments.length > 1) {
        for(var i = 1; i < arguments.length; i++) {
            el.className += ' ' + arguments[i];
        }
    }
    return el;
}

function showMessage() {
    main_container.getElementsByClassName('barrier_message')[0].innerHTML = quotes[0];
    document.body.appendChild(main_container);
}

urls.some(function(url, i, urls) {
    if(currentUrl.indexOf(url) > -1) {
        showMessage();
        return true;
    }
    return false;
});

function shuffle(array) {
    var len = array.length;
    for(var i = 0; i < len - 1; i++) {
        var rind = Math.floor(Math.random() * (len - i));
        swap(array, i, rind + i);
    }
}

function swap(array, i, j) {
    var b = array[i];
    array[i] = array[j];
    array[j] = b;
}
