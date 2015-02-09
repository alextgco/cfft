


var tiptip_content = {};

// -----------------//
// Работа с XML
// -----------------//

function xmlParser(xml) {

  var html = "";
  html+= '<h1 style="">С Ц Е Н А</h1>';
  var values = {};
  var rc = $(xml).find("rc").text();
  if(rc==0){
    tiptip_content = {};
    $(xml).find("PLACEMENT_MAP").each(function() {
      values['id'] = $(this).find("ID").text();
      values['sectionname'] = $(this).find("AREA").text();
      values['left'] = $(this).find("X").text();
      values['top'] = $(this).find("Y").text();
      values['row'] = $(this).find("ROW").text();
      values['col'] = $(this).find("COL").text();
      values['price'] = $(this).find("PRICE").text();
      values['color'] = $(this).find("COLOR").text();
      values['status'] = $(this).find("STATUS").text();
      values['cursor'] = "pointer";

      tiptip_content[values['id']] = {};

      tiptip_content[values['id']]['row'] = values['row'];
      tiptip_content[values['id']]['col'] = values['col']+"<br> id: "+values['id'];
      tiptip_content[values['id']]['price'] = '<br>стоимость: <span>'+values['price']+'</span> руб';
      tiptip_content[values['id']]['sectionname'] = values['sectionname'];

      if(values['status'] == 1){
        values['color'] = "gray";
        values['cursor'] = "default";
        tiptip_content[values['id']]['price'] = '<br/><span style="color:#FF3333;">Недоступен для заказа</span>';
      }
      html+= '<div id="place'+values['id']+'" class="place status'+values['status']+'" IdPlace="'+values['id']+'" sectionname="'+values['sectionname']+'" price="'+values['price']+'" col="'+values['col']+'" row="'+values['row']+'" style="cursor: '+values['cursor']+';background:'+values['color']+';top:'+values['top']+'%;left:'+values['left']+'%" unselectable="1"></div>';

    })
    $(".scalebox").html(html).ready(function(){
      actions();
    })

    $(".change_vid").click(function(){
      change_vid($(this));
    })
  }
  else {
    alert($(xml).find("errordescription").text());
  }
}


// -----------------//
// Работа с JSON
// -----------------//

function jsonToObj(obj){
    obj = JSON.parse(obj);
    var obj_true = {};
    var objIndex = {};
    for (i in obj['DATA']){
        for(var index in obj['NAMES']){
            if(obj_true[i] == undefined){obj_true[i] = {};}
            obj_true[i][obj['NAMES'][index]] = obj['DATA'][i][index];
        }
    }
    return obj_true;
}


function jsonParser(json){
  var html = "";
  html+= '<h1 style="">С Ц Е Н А</h1>';
  var values = {};
  var obj_true = jsonToObj(json);
  for (var i in obj_true){
      for (var key in obj_true[i]){
        values[key] = obj_true[i][key];
        values['cursor'] = "pointer";
      }
      tiptip_content[values["ID"]] = {};
      tiptip_content[values["ID"]]['row'] = values['LINE'];
      tiptip_content[values["ID"]]['col'] = values['PLACE'];//+"<br> id: "+values['ID'];
      tiptip_content[values["ID"]]['price'] = '<br>стоимость: <span>'+values['PRICE']+'</span> руб';
      tiptip_content[values["ID"]]['sectionname'] = values['AREA'];

      if(values['STATUS'] == 0){
        values['COLOR'] = "gray";
        values['cursor'] = "default";
        tiptip_content[values['ID']]['price'] = '<br/><span style="color:#FF3333;">Недоступен для заказа</span>';
      }
      html+= '<div id="place'+values['ID']+'" class="place status'+values['STATUS']+'" IdPlace="'+values['ID']+'" sectionname="'+values['AREA']+'" price="'+values['PRICE']+'" col="'+values['PLACE']+'" row="'+values['LINE']+'" style="cursor: '+values['cursor']+';background:'+values['COLOR']+';top:'+values['Y']+'%;left:'+values['X']+'%" unselectable="1"></div>';
  }
  $(".scalebox").html(html).ready(function(){
    actions();
  })
}

// -----------------//
/* Класс который навешивает события */
// -----------------//

function actions(){
  myplace = new (function() {
    var curX = -1;
    var curY = -1;
    var clickms = 200;
    var lastMouseDown = 0;
    var placesdrag = false;
    var $scalebox;
    var $places;
    var instance = this;
    /* Срабатывает при клике */
    this.checkPlace = function() {
      //if(placesdrag) return;
      var d = new Date();
      if((d.getTime() - lastMouseDown) > clickms) {return;}
      $e = $(this);
      if(!$e.hasClass('status1')) return;
      $e.toggleClass('sel');
      var IdPlace = $e.attr('IdPlace');
      var p = $('#orderbox .hplaces #p'+IdPlace);
      if(p.length) {
      p.remove();
      var count = parseInt($('#orderbox .count').html());
      count--;
      $('#orderbox .count').html(count.toString());
      var price = parseFloat($('#orderbox .amount').html());
      price -= parseFloat($e.attr('price'));
      $('#orderbox .amount').html(price.toString());
      } else {
      //$('#orderbox .hplaces').append('<div id="p'+IdPlace+'" class="item">'+$e.attr('SectionName')+' ряд: '+$e.attr('row')+', место: '+$e.attr('col')+' стоимость: '+$e.attr('price')+' '+'<input type="hidden" name="places[]" value="'+IdPlace+'" /></div>');
      $('#orderbox .hplaces').append('<div id="p'+IdPlace+'" class="item"><input class="place" type="hidden" name="places[]" value="'+IdPlace+'" /></div>');
      var count = parseInt($('#orderbox .count').html());
      count++;
      $('#orderbox .count').html(count.toString());
      var price = parseFloat($('#orderbox .amount').html());
      price += parseFloat($e.attr('price'));
      $('#orderbox .amount').html(price.toString());
      }
      if($('#orderbox .hplaces div.item').length) $('#orderbox .hbox').css('display', '');
      else $('#orderbox .hbox').css('display', 'none');
    }
    this.scaledelta = function(delta) {
      var curwidth = $scalebox.width();
      var curheight = $scalebox.height();
      if(curwidth+delta>10) {
        var k = (curwidth+delta)/curwidth;
        if(curX!=-1 && curY!=-1) {
          var pl = $scalebox.position().left;
          var pt = $scalebox.position().top;
          var dx = Math.round((curX-pl)*(k-1));
          var dy = Math.round((curY-pt)*(k-1));
          $scalebox.css({'left':(pl - dx), 'top':(pt - dy)});
        }
        $scalebox.width(curwidth+delta);
        $scalebox.height(curheight+delta);
      }
    }
    /* Срабатывает при нажатии плюса */
    this.scaleplus = function() {
      var delta = 4;
      var curwidth = $scalebox.width();
      var curheight = $scalebox.height();
      var places = $('#places');
      var cX = Math.round(places.width()/2);
      var cY = Math.round(places.height()/2);
      if(curwidth+delta>10) {
        var k = (curwidth+delta)/curwidth;
        if(cX!=-1 && cY!=-1) {
          var pl = $scalebox.position().left;
          var pt = $scalebox.position().top;
          var dx = Math.round((cX-pl)*(k-1));
          var dy = Math.round((cY-pt)*(k-1));
          $scalebox.css({'left':(pl - dx), 'top':(pt - dy)});
        }
        $scalebox.width(curwidth+delta);
        $scalebox.height(curheight+delta);
      }
    }
    /* Срабатывает при нажатии минуса */
    this.scaleminus = function() {
      var delta = -4;
      var curwidth = $scalebox.width();
      var curheight = $scalebox.height();
      var places = $('#places');
      var cX = Math.round(places.width()/2);
      var cY = Math.round(places.height()/2);
      if(curwidth+delta>10) {
        var k = (curwidth+delta)/curwidth;
        if(cX!=-1 && cY!=-1) {
          var pl = $scalebox.position().left;
          var pt = $scalebox.position().top;
          var dx = Math.round((cX-pl)*(k-1));
          var dy = Math.round((cY-pt)*(k-1));
          $scalebox.css({'left':(pl - dx), 'top':(pt - dy)});
        }
        $scalebox.width(curwidth+delta);
        $scalebox.height(curheight+delta);
      }
    }

    $(function() {
      $scalebox = $('#places .scalebox');
      $places = $('#places');
      $places.mousewheel(function(event, delta) {
        instance.scaledelta(delta*2);
        event.preventDefault();
      });
      $places.mousemove(function(event) {
      event.preventDefault();
      if(placesdrag) {
      var X = event.pageX - $(this).offset().left;
      var Y = event.pageY - $(this).offset().top;
      var pl = $scalebox.position().left;
      var pt = $scalebox.position().top;
      $scalebox.css({'left':(pl - (curX-X)), 'top':(pt - (curY-Y))});
      }
      curX = event.pageX - $(this).offset().left;
      curY = event.pageY - $(this).offset().top;
      });
      $places.mousedown(function(event) {
        event.preventDefault();
        var d = new Date();
        lastMouseDown = d.getTime();
        curX = event.pageX - $(this).offset().left;
        curY = event.pageY - $(this).offset().top;
        placesdrag = true;
        $(this).css({'cursor':'move'});
      });
      $places.mouseup(function(event) {
        $(this).css({'cursor':'default'});
        event.preventDefault();
        curX = event.pageX - $(this).offset().left;
        curY = event.pageY - $(this).offset().top;
        placesdrag = false;
        /*var d = new Date();
        if((d.getTime() - lastMouseDown) < clickms) {
        placesdrag = false;
        } else {
        setTimeout(function() {placesdrag = false;}, 1);
        }*/
      });
      var maxX = 0;
      var maxY = 0;
      $('#places div.place').each(function(index, e) {
        var $e = $(e);
        var left = $e.position().left;
        var top = $e.position().top;
        if(left > maxX) maxX = left;
        if(top > maxY) maxY = top;
        $(this).mouseenter(function(){
          var id = $(this).attr("id").replace("place","");
          var html = "";
          html+= tiptip_content[id]['sectionname'];
          html+= '<br>ряд '+tiptip_content[id]['row']+', ';
          html+= 'место '+tiptip_content[id]['col']+'';
          html+= ' '+tiptip_content[id]['price'];
          $("#tiptip_content").html(html);
        })
      });
      if(maxX && maxY) {
        var kx = maxX / $places.width();
        var ky = maxY / $places.height();
        var k = kx;
        if(kx < ky) k = ky;
        $scalebox.width(Math.round($scalebox.width()/k));
        $scalebox.height(Math.round($scalebox.height()/k));
        $scalebox.children('h1').css('width', Math.round((maxX+0)/26*100)+'%');
        //$scalebox.children('h1').css('left', Math.round((maxX/2-140)/50*100)+'%');
        //$scalebox.children('h1').css('top', Math.round(10)+'%');

        //$scalebox.children('h1').css('width', Math.round((maxX+20)/50*100)+'%');
      }
      $('#places div.place').tipTip({delay:600});
      $('#places div.place').click(instance.checkPlace);

      // -----------------//
      /* Срабатывает при клике на оплатить */
      // -----------------//

      $("#order_true").click(function(){
        form_crm_btn();
      })
      //'onclick'=>'myplace.checkPlace(this)'
    });
  }); 
}

function form_crm () {
  $(this).attr("disabled","true");
  $(".formpay").show();
  $("#parent").hide();
}

function form_map (){
  $(".formpay").hide();
  $("#parent").show();
}


function form_crm_btn(){
  /*
  var array_crm = check_form();
  if(array_crm!=undefined){
    var ids = [];
    var ids_str = "";
    $("#orderbox").find("input.place").each(function(){
      ids[ids.length] = this.value;
      ids_str+=this.value+","
    });
    ids_str = ids_str.substring(0, ids_str.length - 1);
    array_crm['phone'] = array_crm['phone'].replace("(","");
    array_crm['phone'] = array_crm['phone'].replace(")","");
    array_crm['phone'] = array_crm['phone'].replace(" ","");
    array_crm['phone'] = array_crm['phone'].replace("-","");
    array_crm['phone'] = array_crm['phone'].replace("-","");
    var json = {command:"create_order",params:{"id":ids_str,"first_name":array_crm['first_name'],"last_name":array_crm['last_name'],"phone":array_crm['phone'],"email":array_crm['email']}}
    sendQuery(json,function(result){
      log("test");
      if($(result).find("rc").text() == 0){
        //alert("Ok \n Заказанно "+ids.length+" билета. На сумму:"+$(".amount").html());
        formpay(result,array_crm);
      } 
      else {
        alert($(result).find("errordescription").text())
      }
    },doc_root+"/cgi-bin/b2c");
  }
  */
  var $_GET = GET();
  var action_id = $_GET['action_id'];
  var ids = [];
  var ids_str = "";
  $("#orderbox").find("input.place").each(function(){
    ids[ids.length] = this.value;
    ids_str+=this.value+","
  });
  ids_str = ids_str.substring(0, ids_str.length - 1);
  var json = {command:"create_order",subcommand:"",params:{"id":ids_str,"action_id":action_id}}
  sendQuery(json,function(result){
    formpay(result);
  },doc_root+"/cgi-bin/b2e");
}

function check_form(){
  var check = 1;
  var parent = $("#FormPay");
  var array_crm = [];
  parent.find("input").each(function(){
    if($(this).attr("name")!=undefined){
      if($(this).val()==""){
        $(this).css("border","1px solid red");
        check = 0;
      }
      else {
        $(this).css("border","1px solid green");
      }
      if($(this).attr("name")=="email"){
        if(checkmail($(this).val())==false){
          $(this).css("border","1px solid red");
          check=0;
        }
        else {
          $(this).css("border","1px solid green");
        }
      }
      if($(this).attr("name")=="phone"){

      }
      array_crm[$(this).attr("name")] = $(this).val();
    }
  })
  if(check == 1){
    $(".error_msg").hide("fast");
    return array_crm;
  }
  else {
    $(".error_msg").show("fast");
  }
}



function checkmail(value) {
  reg = /^([a-z0-9_\.-])+@[a-z0-9-]+\.([a-z]{2,4}\.)?[a-z]{2,4}$/i;
  if (!value.match(reg)) {
    return false; 
  }
}

function formpay(result){
  var values = {};

  var merchant_id = result['MERCHANT_ID'];
  var product_id = result['PRODUCT_ID'];
  var secret_word = result['SECRET_WORD'];

  values['merchant_id'] = merchant_id;
  values['product_id'] = product_id;
  values['secret_word'] = secret_word;
  values['amount'] = $(".amount").html();
  values['cf'] = result['ID'];
  values['cf2'] = result['CF2'];

  values['cb_url'] = result['CB_URL']; //"http://81.200.5.254:888/cgi-bin/acqp_callback";
  values['ok_url'] = doc_root+"/content/scene/payment_ok.php";
  values['ko_url '] = doc_root+"/content/scene/payment_ko.html";

  

  var t = merchant_id + product_id + values['amount'] + values['cf'] + secret_word;
  values['token'] = result['TOKEN'];

  var html = "";
  for(key in values){
    html+= key+'<input type="text" name="'+key+'" value="'+values[key]+'" />';
  }

  //$(".POST").html(html);
  $("#FormPay").html(html);
  $("#FormPay").submit();
}


function getChar(event) {
  if (event.which == null) {
    if (event.keyCode < 32) return null;
    return String.fromCharCode(event.keyCode) // IE
  }

  if (event.which!=0 && event.charCode!=0) {
    if (event.which < 32) return null;
    return String.fromCharCode(event.which)   // остальные
  }

  return null; // специальная клавиша
}


function sendQuery(obj, callback) {
    var o = obj.subcommand;
    delete obj.subcommand;
    obj.object = o;
    var xml = "";
    var url = "/cgi-bin/b2e";
    xml = "request=<query>";
    if (typeof obj === "object") {
      if (obj.hasOwnProperty("command")) {
          for (var i in obj) {
              if (obj.hasOwnProperty(i)) {
                  if (i === "params") {
                      if (typeof obj[i] === "object") {
                          for (var j in obj.params) {
                              xml += "<" + j + ">" + obj.params[j] + "</" + j + ">";
                          }
                      }
                  } else {
                      if(i === "object" && obj[i]==""){

                      }
                      else {
                        xml += "<" + i + ">" + obj[i] + "</" + i + ">";
                      }
                      
                  }              
              }
          }    
      }
    }
    xml += "</query>";
    $.getJSON( url, xml, function (response, textStatus, jqXHR) {
        if (textStatus === "success") {
          if (response && typeof response === "object") {
            if (response.hasOwnProperty("RC")) {
              var rc = parseInt(response.RC);
              if (rc === 0) {
                  callback(response);
              } else {
                alertWin({con:response.MESSAGE});
                //toastr.error("Ошибка: " + response.RC + ": " + response.MESSAGE, "MBOOKER.Fn.sendQuery");

              }
            }
          }
        }
    });
};

function alertWin(obj){
  var div = $(".alertWin");
  if(obj.con != undefined){
    div.find(".alertWinContent").html(obj.con);
  }
  var divWidth = div.width();
  var divHeight = div.height();
  div.css("left","50%").css("margin-left",(divWidth/2)*(-1)).css("top","20%").css("margin-top",(divHeight)*(-1));
  div.show();
}


function GET(){
  var $_GET = {};
  document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
    function decode(s) {
      return decodeURIComponent(s.split("+").join(" "));
    }
    $_GET[decode(arguments[1])] = decode(arguments[2]);
  });
  return $_GET;
}


function log(obj){
  console.log(obj);
}