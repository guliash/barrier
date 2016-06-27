var _currentQuote = 0;
var _quotes, _blockedSites, _blockedSite;
var _time;

var TimeEnum = {
    MILLIS: 0,
    SECONDS: 1,
    MINUTES: 2,
    HOURS: 3
};

var portStorage = chrome.runtime.connect({ name: 'storage' });
var portApi = chrome.runtime.connect({ name: 'api' });

portStorage.onMessage.addListener(function(msg) {
    switch(msg.type) {
        case 'save':
            break;
        case 'get':
            onGetOptions(msg.data);
            break;
    }
});

portApi.onMessage.addListener(function(msg) {
    switch(msg.method) {
        case 'quotes':
            onGetQuotes(msg);
            break;
    }
});

var prevQuoteIconMouseOut = chrome.extension.getURL('images/ic_keyboard_arrow_left_white_56.png');
var nextQuoteIconMouseOut = chrome.extension.getURL('images/ic_keyboard_arrow_right_white_56.png');
var prevQuoteIconMouseOver = chrome.extension.getURL('images/ic_keyboard_arrow_left_grey_56.png');
var nextQuoteIconMouseOver = chrome.extension.getURL('images/ic_keyboard_arrow_right_grey_56.png');

var leaveIconMouseOut = chrome.extension.getURL('images/angel-light-96.png');
var leaveIconMouseOver = chrome.extension.getURL('images/angel-96.png');
var proceedIconMouseOut = chrome.extension.getURL('images/poison-less-96.png');
var proceedIconMouseOver = chrome.extension.getURL('images/poison-96.png');

var body =
'<div class="barrier-sub-container"> \
    <div class="barrier-mid-top-panel"> \
        <div class="barrier-left-column"> \
            <div class="barrier-img-container"> \
                <img id="barrier-prev-quote" src="' + prevQuoteIconMouseOut + '"> \
            </div> \
        </div> \
        <div class="barrier-mid-column"> \
            <div class="barrier-quote-container"> \
                <p class="barrier-quote"> \
                    <span class="barrier-message" id="barrier-message"></span> \
                    <span class="barrier-author" id="barrier-author"></span> \
                </p> \
            </div> \
        </div> \
        <div class="barrier-right-column"> \
            <div class="barrier-img-container"> \
                <img id="barrier-next-quote" src="' + nextQuoteIconMouseOut + '"> \
            </div> \
        </div> \
    </div> \
    <div class="barrier-mid-bottom-panel"> \
        <div class="barrier-left-column"> \
        </div> \
        <div class="barrier-mid-column"> \
            <img id="barrier-leave" class="barrier-leave" src="' + leaveIconMouseOut + '"> \
            <img id="barrier-proceed" class="barrier-proceed" src="' + proceedIconMouseOut + '"> \
        </div> \
        <div class="barrier-right-column"> \
        </div> \
    </div> \
    <div class="barrier-footer"> \
        <p>\
            <a href="https://guliash.com/barrier" id="barrier-homepage-link"></a>\
            <a href="https://icons8.com" id="barrier-icons8-link"></a>\
        </p> \
    </div> \
</div>';

function localize() {
    document.getElementById('barrier-prev-quote').alt = chrome.i18n.getMessage("prev_quote");
    document.getElementById('barrier-prev-quote').title = chrome.i18n.getMessage("prev_quote");

    document.getElementById('barrier-next-quote').alt = chrome.i18n.getMessage("next_quote");
    document.getElementById('barrier-next-quote').title = chrome.i18n.getMessage("next_quote");

    document.getElementById('barrier-leave').alt = chrome.i18n.getMessage("leave_site");
    document.getElementById('barrier-leave').title = chrome.i18n.getMessage("leave_site");

    document.getElementById('barrier-proceed').alt = chrome.i18n.getMessage("close_warning");
    document.getElementById('barrier-proceed').title = chrome.i18n.getMessage("close_warning");

    document.getElementById('barrier-homepage-link').innerHTML = chrome.i18n.getMessage("homepage");
    document.getElementById('barrier-icons8-link').innerHTML = chrome.i18n.getMessage("icons8");
}

function showQuote() {
    var quote = _quotes[_currentQuote];
    showQuoteMessage(quote);
    showQuoteAuthor(quote);
}

function showQuoteMessage(quote) {
    document.getElementById('barrier-message').innerHTML = '«' + quote.quote + '»';
}

function showQuoteAuthor(quote) {
    var str = (quote.author ? quote.author : chrome.i18n.getMessage("unknown_author"));
    str = '(' + str + ')';
    document.getElementById('barrier-author').innerHTML = str;
}

function changeQuote(dir) {
    _currentQuote = (_currentQuote + dir + _quotes.length) % _quotes.length;
    showQuote();
}

function showWarning(site) {

    if(document.getElementById('barrier-main-container')) {
        return;
    }

    var mainContainer = _createElement('div', 'barrier-main-container');
    mainContainer.id = 'barrier-main-container';
    mainContainer.innerHTML = body;

    shuffle(_quotes);

    document.body.appendChild(mainContainer);

    localize();

    showQuote();

    var prevBtn = document.getElementById('barrier-prev-quote');
    var nextBtn = document.getElementById('barrier-next-quote');
    var leaveBtn = document.getElementById('barrier-leave');
    var proceedBtn = document.getElementById('barrier-proceed');

    prevBtn.addEventListener("click", function() {
        changeQuote(-1);
    });

    nextBtn.addEventListener("click", function() {
        changeQuote(1);
    });

    proceedBtn.addEventListener("click", function() {
        document.body.removeChild(document.getElementById('barrier-main-container'));
        for(var i = 0; i < _blockedSites.length; i++) {
            if(_blockedSites[i].domain == site.domain) {
                _blockedSites[i].lastClosed = getTimestamp(TimeEnum.MILLIS);
            }
        }
        portStorage.postMessage({ type: 'save', data: { blockedSites: _blockedSites } });
    });

    leaveBtn.addEventListener("click", function() {
        window.location.href = "http://www.google.com/";
    });

    prevBtn.addEventListener('mouseover', function() {
        prevBtn.src = prevQuoteIconMouseOver;
    });

    nextBtn.addEventListener('mouseover', function() {
        nextBtn.src = nextQuoteIconMouseOver;
    });

    prevBtn.addEventListener('mouseout', function() {
        prevBtn.src = prevQuoteIconMouseOut;
    });

    nextBtn.addEventListener('mouseout', function() {
        nextBtn.src = nextQuoteIconMouseOut;
    });

    leaveBtn.addEventListener('mouseover', function() {
        leaveBtn.src = leaveIconMouseOver;
    });

    leaveBtn.addEventListener('mouseout', function() {
        leaveBtn.src = leaveIconMouseOut;
    });

    proceedBtn.addEventListener('mouseover', function() {
        proceedBtn.src = proceedIconMouseOver;
    });

    proceedBtn.addEventListener('mouseout', function() {
        proceedBtn.src = proceedIconMouseOut;
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

function onGetOptions(data) {
    _time = data.time;
    _blockedSites = data.blockedSites;

    _blockedSite = getBlockedSite();
    if(!_blockedSite) {
        return;
    }

    portApi.postMessage({ method: 'quotes', params: [['type', _blockedSite.type]] });
}

function onGetQuotes(result) {
    if(result.success) {
        _quotes = result.data;
        showWarning(_blockedSite);
    }
}

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

function getTimestamp(units) {
    return millisToUnit(new Date().getTime(), units);
}

function timeToMillis(time, currentUnit) {
    var millis;
    switch(currentUnit) {
        case TimeEnum.MILLIS:
            millis = time;
            break;
        case TimeEnum.SECONDS:
            millis = time * 1000;
            break;
        case TimeEnum.MINUTES:
            millis = time * 60 * 1000;
            break;
        case TimeEnum.HOURS:
            millis = time * 60 * 60 * 1000;
            break;
        default:
            throw 'Not correct time unit';
    }
    return Math.floor(millis);
}

function millisToUnit(millis, toUnit) {
    var result;
    switch(toUnit) {
        case TimeEnum.MILLIS:
            result = millis;
            break;
        case TimeEnum.SECONDS:
            result = millis / 1000;
            break;
        case TimeEnum.MINUTES:
            result = millis / (60 * 1000);
            break;
        case TimeEnum.HOURS:
            result = millis / (60 * 60 * 1000);
            break;
        default:
            throw 'Not correct time unit';
    }
    return result;
}

function timeToUnit(time, fromUnit, toUnit) {
    var millis = timeToMillis(time, fromUnit);
    return millisToUnit(millis, toUnit);
}

portStorage.postMessage({ type: 'get' });
