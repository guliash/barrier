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
