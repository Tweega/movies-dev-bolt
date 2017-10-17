var layer = require('./3layer');
var utils = require('./Utils');
$(function () {

  var opt = {
          autoOpen: false,
          modal: true,
          width: 550,
          height:650,
          title: '3 Way relationships - layer selection',
          buttons: {
                              "Ok": function() {
                                  $(this).dialog("close");
                                  ok();
                              },
                              "Cancel": function() {
                                  $(this).dialog("close");
                                  close();
                              }
                          }
  };


theDialog = $("#dialog").dialog(opt);
theDialog.data('pivotChange', layer.getRelatedLayers);
theDialog.data('relationChange', layer.handleRelationChange);




}) //$function

$( window ).load(function() {
  var lay3r = layer.create3Layer();
});

function ok(){
  console.log("ok");
  var loader = theDialog.data('loadData');
  console.log("theDialog.data.selectedInfo");
  console.log(theDialog.data('selectedInfo'));
  var opts = theDialog.data('selectedInfo');
  loader(opts);
}

function close() {
  console.log("cancel");
}

function pivot_change(d){
  console.log("jelly");
}
