//var url_xml = 'tmp/test.xml';
$(document).ready(function () {
  $_GET = GET();
  var hrefSplit =  window.location.href.split("//");
  var href = hrefSplit[1].split("/");
  doc_root = hrefSplit[0]+"//"+href[0];
  var url_xml = doc_root+"/cgi-bin/b2c?p_xml=<query><command>get_action_scheme_ie</command><action_id>"+$_GET['action_id']+"</action_id></query>";
  $(".mmenu").hide();
  $.ajax({
    type: "GET",
    url: url_xml,
    dataType: "html",
    success: jsonParser
  });
  $("#form_crm_btn").click(function(){
    form_crm_btn($(this));
  })
  $("#back_map").click(function(){
    form_map();
  })
  $("#FormPay input").keyup(function(e){
    check_form();
  })
  $("#FormPay input").change(function(e){
    check_form();
  })
  $("#FormPay input[name='phone']").mask('7(999) 999-99-99');

});