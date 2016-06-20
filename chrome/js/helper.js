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

var TimeEnum = {
    MILLIS: 0,
    SECONDS: 1,
    MINUTES: 2,
    HOURS: 3
};

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
