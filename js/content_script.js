var currentQuote = 0;

var left_image_white_url = chrome.extension.getURL('images/ic_keyboard_arrow_left_white_48dp_2x.png');
var right_image_white_url = chrome.extension.getURL('images/ic_keyboard_arrow_right_white_48dp_2x.png');
var left_image_grey_url = chrome.extension.getURL('images/ic_keyboard_arrow_left_grey_48dp_2x.png');
var right_image_grey_url = chrome.extension.getURL('images/ic_keyboard_arrow_right_grey_48dp_2x.png');

var body =
'<div class="barrier_sub_container"> \
    <div class="barrier_mid_top_panel"> \
        <div class="barrier_left_column"> \
            <div class="barrier_img_container"> \
                <img id="barrier_left_arrow" src="' + left_image_white_url + '"/> \
            </div> \
        </div> \
        <div class="barrier_mid_column"> \
            <div class="barrier_message_container"> \
                <p id="barrier_message" class="barrier_message"/> \
            </div> \
        </div> \
        <div class="barrier_right_column"> \
            <div class="barrier_img_container"> \
                <img id="barrier_right_arrow" src="' + right_image_white_url + '"/> \
            </div> \
        </div> \
    </div> \
    <div class="barrier_mid_bottom_panel"> \
    </div> \
</div>';

var main_container = _createElement('div', 'barrier_main_container');

main_container.innerHTML = body;

function _createElement() {
    var el = document.createElement(arguments[0]);
    if(arguments.length > 1) {
        for(var i = 1; i < arguments.length; i++) {
            el.className += ' ' + arguments[i];
        }
    }
    return el;
}

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

function showQuote() {
    document.getElementById('barrier_message').innerHTML = quotes[currentQuote];
}

function changeQuote(dir) {
    currentQuote = (currentQuote + dir + quotes.length) % quotes.length;
    showQuote();
}

function main() {
    shuffle(quotes);

    document.body.appendChild(main_container);

    showQuote();

    var left_btn = document.getElementById('barrier_left_arrow');
    var right_btn = document.getElementById('barrier_right_arrow');

    left_btn.addEventListener("click", function() {
        changeQuote(-1);
    });
    right_btn.addEventListener("click",
        function() {
            changeQuote(1);
        }
    );

    left_btn.addEventListener('mouseover', function() {
        left_btn.src = left_image_grey_url;
    });

    right_btn.addEventListener('mouseover', function() {
        right_btn.src = right_image_grey_url;
    });

    left_btn.addEventListener('mouseout', function() {
        left_btn.src = left_image_white_url;
    });

    right_btn.addEventListener('mouseout', function() {
        right_btn.src = right_image_white_url;
    });
}

urls.some(function(url, i, urls) {
    if(window.location.href.indexOf(url) > -1) {
        main();
        return true;
    }
    return false;
});
