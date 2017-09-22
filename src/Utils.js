

function getPixelsPerEmFromElement (element) {
    if (element.parentNode) {
        var parentFontSize = parseFloat(window.getComputedStyle(element.parentNode).fontSize);
        var elementFontSize = parseFloat(window.getComputedStyle(element).fontSize);
        var pixelValueOfOneEm = (elementFontSize / parentFontSize) * elementFontSize;
        return pixelValueOfOneEm;
    }
    return false;
}

function getFontSize(elem) {
  //returns font size in pixels -- at least that is what is appears to always do
  return parseFloat(window.getComputedStyle(elem).fontSize);
}


// var el = document.getElementById('foo');
// var style = window.getComputedStyle(el, null).getPropertyValue('font-size');
// var fontSize = parseFloat(style);
// // now you have a proper float for the font size (yes, it can be a float, not just an integer)
// el.style.fontSize = (fontSize + 1) + 'px';


exports.render = getPixelsPerEmFromElement;
exports.getFontSize = getFontSize;
