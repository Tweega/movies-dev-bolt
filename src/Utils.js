const consts = {WEST: 0, EAST: 1, LHS: 0, RHS: 1, PIVOT: 2};

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

function traverseTree(rootNode, handleChild, handleRollup, props, getChildren) {
  var depth = 0;

  if (typeof(getChildren) == "undefined") {
    getChildren = function(node) {return node.children;};
  }

  if (handleChild != null) {
    handleChild(rootNode, props, depth);
  }

  var nextChildren = rootNode.children || [];
  nextChildren = nextChildren.map(function(c, i){
    return c;
  });

  var sanity = 0;

  var toDoLists = [nextChildren.reverse()];

  var parents = [rootNode];

  var lenToDoLists = toDoLists.length;



  while ((lenToDoLists > 0) && (sanity < 100000)) {
    let nextToDoList = toDoLists[lenToDoLists - 1];

    if (nextToDoList.length == 0) {
      let discard = toDoLists.pop();
      let child =  parents.pop();
      depth--;
      let parent = parents[parents.length - 1];

      if (handleRollup != null && typeof(parent) != "undefined") {

        handleRollup(child, parent, props);
      }

    }
    else {
      let nextToDo = nextToDoList.pop();
      parents.push(nextToDo);
      depth++;
      nextChildren = getChildren(nextToDo) || [];
      nextChildren = nextChildren.map(function(c, i){
        return c;
      }); // can't remember what the point of this was - perhaps  there meant to be some kind of filter applied?  We would have a predicate function passed in?
      toDoLists.push(nextChildren.reverse());
      if (handleChild != null) {
        handleChild(nextToDo, props, depth);
      }
    }
    lenToDoLists = toDoLists.length;
    sanity++;
  }
}

function getSideStr(side) {
    return side == consts.LHS ? "lhs_" : "rhs_";
}

const DELOITTE_GREEN = "#3A9238";
const AZUL_EL_HIERRO = "#00A1DE";
const DELOITTE_GREEN_DOT = "#9ACD66";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const DELOITTE_BLUE = "#1B3277";
const SOME_KIND_OF_GREY = "#75787B";
const DELOITTE_COLOURS = [BLACK, DELOITTE_GREEN_DOT, AZUL_EL_HIERRO, DELOITTE_GREEN, SOME_KIND_OF_GREY, DELOITTE_BLUE ];


function deloitte_colour(n) {
  return DELOITTE_COLOURS[n % DELOITTE_COLOURS.length];
}

exports.getPixelsPerEmFromElement = getPixelsPerEmFromElement;
exports.getFontSize = getFontSize;
exports.traverseTree = traverseTree;
exports.consts = consts;
exports.getSideStr = getSideStr;
exports.deloitte_colour = deloitte_colour;
