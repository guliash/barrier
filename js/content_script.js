var currentQuote = 0;

var left_image_white_url = chrome.extension.getURL('images/ic_keyboard_arrow_left_white_48dp_2x.png');
var right_image_white_url = chrome.extension.getURL('images/ic_keyboard_arrow_right_white_48dp_2x.png');
var left_image_grey_url = chrome.extension.getURL('images/ic_keyboard_arrow_left_grey_48dp_2x.png');
var right_image_grey_url = chrome.extension.getURL('images/ic_keyboard_arrow_right_grey_48dp_2x.png');
var check_circle_light_green_url = chrome.extension.getURL('images/ic_check_circle_light_green_48dp_2x.png');
var check_circle_dark_green_url = chrome.extension.getURL('images/ic_check_circle_dark_green_48dp_2x.png');
var cancel_circle_light_red_url = chrome.extension.getURL('images/ic_cancel_light_red_48dp_2x.png');
var cancel_circle_dark_red_url = chrome.extension.getURL('images/ic_cancel_dark_red_48dp_2x.png');

var body =
'<div class="barrier_sub_container"> \
    <div class="barrier_mid_top_panel"> \
        <div class="barrier_left_column"> \
            <div class="barrier_img_container"> \
                <img id="barrier_left_arrow" src="' + left_image_white_url + '"> \
            </div> \
        </div> \
        <div class="barrier_mid_column"> \
            <div class="barrier_message_container"> \
                <p id="barrier_message" class="barrier_message"> \
            </div> \
        </div> \
        <div class="barrier_right_column"> \
            <div class="barrier_img_container"> \
                <img id="barrier_right_arrow" src="' + right_image_white_url + '"> \
            </div> \
        </div> \
    </div> \
    <div class="barrier_mid_bottom_panel"> \
        <div class="barrier_left_column"> \
        </div> \
        <div class="barrier_mid_column"> \
            <img id="barrier_check" class="barrier_check" src="' + check_circle_dark_green_url + '"> \
            <img id="barrier_cancel" class="barrier_cancel" src="' + cancel_circle_dark_red_url + '"> \
        </div> \
        <div class="barrier_right_column"> \
        </div> \
    </div> \
</div>';

var main_container = _createElement('div', 'barrier_main_container');

main_container.innerHTML = body;

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
    var check_btn = document.getElementById('barrier_check');
    var cancel_btn = document.getElementById('barrier_cancel');

    left_btn.addEventListener("click", function() {
        changeQuote(-1);
    });

    right_btn.addEventListener("click", function() {
        changeQuote(1);
    });

    cancel_btn.addEventListener("click", function() {
        document.body.removeChild(main_container);
    });

    check_btn.addEventListener("click", function() {
        window.location.href = "http://www.google.com/";
    });

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

    check_btn.addEventListener('mouseover', function() {
        check_btn.src = check_circle_light_green_url;
    });

    check_btn.addEventListener('mouseout', function() {
        check_btn.src = check_circle_dark_green_url;
    });

    cancel_btn.addEventListener('mouseover', function() {
        cancel_btn.src = cancel_circle_light_red_url;
    });

    cancel_btn.addEventListener('mouseout', function() {
        cancel_btn.src = cancel_circle_dark_red_url;
    });

}

function start(items) {
    items.urls.some(function(url, i, urls) {
        if(url.domain && window.location.href.indexOf(url.domain) > -1) {
            main();
            return true;
        }
        return false;
    });
}

chrome.storage.sync.get({
    time: 5,
    urls: []
}, start);
