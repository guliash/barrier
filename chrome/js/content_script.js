var _currentQuote = 0;
var _quotes, _blockedSites;
var _time;

var leftImageWhiteUrl = chrome.extension.getURL('images/ic_keyboard_arrow_left_white_48dp_2x.png');
var rightImageWhiteUrl = chrome.extension.getURL('images/ic_keyboard_arrow_right_white_48dp_2x.png');
var leftImageGreyUrl = chrome.extension.getURL('images/ic_keyboard_arrow_left_grey_48dp_2x.png');
var rightImageGreyUrl = chrome.extension.getURL('images/ic_keyboard_arrow_right_grey_48dp_2x.png');
var checkCircleLightGreenUrl = chrome.extension.getURL('images/ic_check_circle_light_green_48dp_2x.png');
var checkCircleDarkGreenUrl = chrome.extension.getURL('images/ic_check_circle_dark_green_48dp_2x.png');
var cancelCircleLightRedUrl = chrome.extension.getURL('images/ic_cancel_light_red_48dp_2x.png');
var cancelCircleDarkRedUrl = chrome.extension.getURL('images/ic_cancel_dark_red_48dp_2x.png');

var body =
'<div class="barrier_sub_container"> \
    <div class="barrier_mid_top_panel"> \
        <div class="barrier_left_column"> \
            <div class="barrier_img_container"> \
                <img id="barrier_left_arrow" src="' + leftImageWhiteUrl + '"> \
            </div> \
        </div> \
        <div class="barrier_mid_column"> \
            <div class="barrier_message_container"> \
                <p id="barrier_message" class="barrier_message"> \
            </div> \
        </div> \
        <div class="barrier_right_column"> \
            <div class="barrier_img_container"> \
                <img id="barrier_right_arrow" src="' + rightImageWhiteUrl + '"> \
            </div> \
        </div> \
    </div> \
    <div class="barrier_mid_bottom_panel"> \
        <div class="barrier_left_column"> \
        </div> \
        <div class="barrier_mid_column"> \
            <img id="barrier_check" class="barrier_check" src="' + checkCircleDarkGreenUrl + '"> \
            <img id="barrier_cancel" class="barrier_cancel" src="' + cancelCircleDarkRedUrl + '"> \
        </div> \
        <div class="barrier_right_column"> \
        </div> \
    </div> \
</div>';

var mainContainer = _createElement('div', 'barrier_main_container');

mainContainer.innerHTML = body;

function showQuote() {
    document.getElementById('barrier_message').innerHTML = _quotes[_currentQuote].quote;
}

function changeQuote(dir) {
    _currentQuote = (_currentQuote + dir + _quotes.length) % _quotes.length;
    showQuote();
}

function showWarning(site) {

    if(!isIntervalExpired(site)) {
        return;
    }

    _quotes = filterQuotesByType(site.type);

    shuffle(_quotes);

    document.body.appendChild(mainContainer);

    showQuote();

    var leftBtn = document.getElementById('barrier_left_arrow');
    var rightBtn = document.getElementById('barrier_right_arrow');
    var checkBtn = document.getElementById('barrier_check');
    var cancelBtn = document.getElementById('barrier_cancel');

    leftBtn.addEventListener("click", function() {
        changeQuote(-1);
    });

    rightBtn.addEventListener("click", function() {
        changeQuote(1);
    });

    cancelBtn.addEventListener("click", function() {
        document.body.removeChild(mainContainer);
        for(var i = 0; i < _blockedSites.length; i++) {
            if(_blockedSites[i].domain == site.domain) {
                _blockedSites[i].lastClosed = getTimestamp(TimeEnum.MILLIS);
            }
        }
        chrome.storage.sync.set({
            blockedSites: _blockedSites,
        });
    });

    checkBtn.addEventListener("click", function() {
        window.location.href = "http://www.google.com/";
    });

    leftBtn.addEventListener('mouseover', function() {
        leftBtn.src = leftImageGreyUrl;
    });

    rightBtn.addEventListener('mouseover', function() {
        rightBtn.src = rightImageGreyUrl;
    });

    leftBtn.addEventListener('mouseout', function() {
        leftBtn.src = leftImageWhiteUrl;
    });

    rightBtn.addEventListener('mouseout', function() {
        rightBtn.src = rightImageWhiteUrl;
    });

    checkBtn.addEventListener('mouseover', function() {
        checkBtn.src = checkCircleLightGreenUrl;
    });

    checkBtn.addEventListener('mouseout', function() {
        checkBtn.src = checkCircleDarkGreenUrl;
    });

    cancelBtn.addEventListener('mouseover', function() {
        cancelBtn.src = cancelCircleLightRedUrl;
    });

    cancelBtn.addEventListener('mouseout', function() {
        cancelBtn.src = cancelCircleDarkRedUrl;
    });

}

function filterQuotesByType(type) {
    return _quotes.filter(function(el) {
        if(el.type == type) {
            return true;
        }
    });
}

function isIntervalExpired(site) {
    if(!site.lastClosed) {
        return true;
    }
    var timestampMillis = getTimestamp(TimeEnum.MILLIS);
    return millisToUnit(timestampMillis - site.lastClosed, TimeEnum.MINUTES) >= _time;
}

function main() {
    _blockedSites.some(function(site, i, sites) {
        if(site.domain && window.location.href.indexOf(site.domain) > -1) {
            showWarning(site);
            return true;
        }
        return false;
    });
}

function start() {
    chrome.storage.sync.get({
        time: 5,
        blockedSites: []
    }, function(items) {
        get(host + '/quotes', function(responseText) {
            _time = items.time;
            _blockedSites = items.blockedSites;
            _quotes = JSON.parse(responseText);
            main();
        }, function(error) {
            //nothing
        });
    });
}

start();
