var _currentQuote = 0;
var _quotes, _blockedSites;
var _time;

var port = chrome.runtime.connect({ name: 'storage' });

port.onMessage.addListener(function(msg) {
    if(msg.type == 'save') {
        //nothing
    } else if(msg.type == 'get') {
        start(msg.data);
    } else {
        //nothing
    }
});

var leftImageWhiteUrl = chrome.extension.getURL('images/ic_keyboard_arrow_left_white_48dp_2x.png');
var rightImageWhiteUrl = chrome.extension.getURL('images/ic_keyboard_arrow_right_white_48dp_2x.png');
var leftImageGreyUrl = chrome.extension.getURL('images/ic_keyboard_arrow_left_grey_48dp_2x.png');
var rightImageGreyUrl = chrome.extension.getURL('images/ic_keyboard_arrow_right_grey_48dp_2x.png');
var checkCircleLightGreenUrl = chrome.extension.getURL('images/ic_check_circle_light_green_48dp_2x.png');
var checkCircleDarkGreenUrl = chrome.extension.getURL('images/ic_check_circle_dark_green_48dp_2x.png');
var cancelCircleLightRedUrl = chrome.extension.getURL('images/ic_cancel_light_red_48dp_2x.png');
var cancelCircleDarkRedUrl = chrome.extension.getURL('images/ic_cancel_dark_red_48dp_2x.png');

var body =
'<div class="barrier-sub-container"> \
    <div class="barrier-mid-top-panel"> \
        <div class="barrier-left-column"> \
            <div class="barrier-img-container"> \
                <img id="barrier-left-arrow" src="' + leftImageWhiteUrl + '"> \
            </div> \
        </div> \
        <div class="barrier-mid-column"> \
            <div class="barrier-message-container"> \
                <p id="barrier-message" class="barrier-message"> \
            </div> \
        </div> \
        <div class="barrier-right-column"> \
            <div class="barrier-img-container"> \
                <img id="barrier-right-arrow" src="' + rightImageWhiteUrl + '"> \
            </div> \
        </div> \
    </div> \
    <div class="barrier-mid-bottom-panel"> \
        <div class="barrier-left-column"> \
        </div> \
        <div class="barrier-mid-column"> \
            <img id="barrier-check" class="barrier-check" src="' + checkCircleDarkGreenUrl + '"> \
            <img id="barrier-cancel" class="barrier-cancel" src="' + cancelCircleDarkRedUrl + '"> \
        </div> \
        <div class="barrier-right-column"> \
        </div> \
    </div> \
</div>';

var mainContainer = _createElement('div', 'barrier-main-container');

mainContainer.innerHTML = body;

function showQuote() {
    document.getElementById('barrier-message').innerHTML = _quotes[_currentQuote].quote;
}

function changeQuote(dir) {
    _currentQuote = (_currentQuote + dir + _quotes.length) % _quotes.length;
    showQuote();
}

function showWarning(site) {

    shuffle(_quotes);

    document.body.appendChild(mainContainer);

    showQuote();

    var leftBtn = document.getElementById('barrier-left-arrow');
    var rightBtn = document.getElementById('barrier-right-arrow');
    var checkBtn = document.getElementById('barrier-check');
    var cancelBtn = document.getElementById('barrier-cancel');

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
        port.postMessage({ type: 'save', data: { blockedSites: _blockedSites } });
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

function isIntervalExpired(site) {
    if(!site.lastClosed) {
        return true;
    }
    var timestampMillis = getTimestamp(TimeEnum.MILLIS);
    return millisToUnit(timestampMillis - site.lastClosed, TimeEnum.MINUTES) >= _time;
}

function isSiteBlocked(site) {
    return site.domain && window.location.href.indexOf(site.domain) > -1 && isIntervalExpired(site);
}

function getBlockedSite() {
    for(var i = 0; i < _blockedSites.length; i++) {
        if(isSiteBlocked(_blockedSites[i])) {
            return _blockedSites[i];
        }
    }
    return null;
}

function start(data) {
    _time = data.time;
    _blockedSites = data.blockedSites;

    var blockedSite = getBlockedSite();
    if(!blockedSite) {
        return;
    }

    var url = host + '/quotes?type=' + blockedSite.type;
    get(url, function(responseText) {
        _quotes = JSON.parse(responseText);
        showWarning(blockedSite);
    }, function(error) {
        //nothing
    });
}

port.postMessage({ type: 'get' });
