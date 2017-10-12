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

           var lay3r = layer.create3Layer();


}) //$function

function ok(){
  console.log("ok");
  var loader = theDialog.data('loadData');
  loader({});
}

function close() {
  console.log("cancel");
}

function pivot_change(d){
  console.log("jelly");
}
