
var url_xml = "http://192.168.1.101/cgi-bin/b2e?request=%3Cquery%3E%3Ccommand%3Eget_placement_map%3C/command%3E%3Cevent_item_id%3E132%3C/event_item_id%3E%3C/query%3E";
//var url_xml = 'tmp/test.xml';
$(document).ready(function () {
  $(".mmenu").hide();
  $.ajax({
    type: "GET",
    url: url_xml,
    dataType: "xml",
    success: xmlParser
  });

  $(".test_post").click(function(){
    $("#test_post").toggle("fast");
      /*
      var json = {"payment_id":"","datetime":"","status":"Ok","pp_identity":"","cf":"1000","cf2":"","cf3":"","sign":"",}
      $.ajax({
        type: "POST",
        url: "http://81.200.5.254:888/cgi-bin/acqp_callback",
        data: json,
      });
      */
      //send_query(json);
    
  })

});


function change_vid(obj_this){
  var id = obj_this.attr("id").replace("vid_","");  
  //obj_this.toggle(function () {})
  switch(id){
    case "1":
      //$(".place").css("background","red")
      $(".place").css("border-radius","30px");
    break;
    case "2":
      $(".place").css("box-shadow","0 0 1px red");
    break;
  }
  obj_this.removeClass("change_vid");
  obj_this.addClass("cancel_vid");
  obj_this.html("Отменить "+id);
  $(".cancel_vid").click(function(){
    cancel_vid($(this));
  })
}

function cancel_vid (obj_this) {
  var id = obj_this.attr("id").replace("vid_","");  
  //obj_this.toggle(function () {})
  switch(id){
    case "1":
      //$(".place").css("background","red")
      $(".place").css("border-radius","0px");
    break;
    case "2":
      $(".place").css("box-shadow","none");
    break;
  }
  obj_this.removeClass("cancel_vid");
  obj_this.addClass("change_vid");
  obj_this.html("Вид "+id);
  $(".change_vid").click(function(){
    change_vid($(this));
  })
}
 
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
      tiptip_content[values['id']]['col'] = values['col'];
      tiptip_content[values['id']]['price'] = '<br>стоимость:'+values['price']+' руб';
      tiptip_content[values['id']]['sectionname'] = values['sectionname'];

      if(values['status'] != 1){
        values['color'] = "gray";
        values['cursor'] = "default";
        tiptip_content[values['id']]['price'] = '<br/><span style="color:#FF3333;">Недоступен для заказа</span>';
      }
      html+= '<div id="place'+values['id']+'" class="place status'+values['status']+'" IdPlace="'+values['id']+'" sectionname="'+values['sectionname']+'" price="'+values['price']+'" col="'+values['col']+'" row="'+values['row']+'" style="cursor: '+values['cursor']+';background:'+values['color']+';top:'+values['top']+'%;left:'+values['left']+'%" unselectable="1"></div>';

    })
    $(".scalebox").html(html).ready(function(){
      actions();
    })
    
    //alert($(xml).find("rc").text())
    /*
    $('#load').fadeOut();
    $(xml).find("Book").each(function () {
      $(".main").append('<div class="book"><div class="title">' + $(this).find("Title").text() + '</div><div class="description">' + $(this).find("Description").text() + '</div><div class="date">Published ' + $(this).find("Date").text() + '</div></div>');
      $(".book").fadeIn(1000);
    });
    */

    $(".change_vid").click(function(){
      change_vid($(this));
    })
    
    
  }
  else {
    alert("Ошибка оракла")
  }
  
}

/* Класс который навешивает события */

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
      $('#orderbox .hplaces').append('<div id="p'+IdPlace+'" class="item"><input type="hidden" name="places[]" value="'+IdPlace+'" /></div>');
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
        //$scalebox.children('h1').css('left', Math.round((maxX/2-140)/50*100)+'%');
        //$scalebox.children('h1').css('top', Math.round(10)+'%');

        //$scalebox.children('h1').css('width', Math.round((maxX+20)/50*100)+'%');
      }
      $('#places div.place').tipTip({delay:600});
      $('#places div.place').click(instance.checkPlace);

      /* Срабатывает при клике на оплатить */

      $("#order_true").click(function(){
        var parent = $(this).parents("#orderbox");
        var ids = [];
        var ids_str = "";
        parent.find("input").each(function(){
          if(this.id!="order_true"){
            ids[ids.length] = this.value;
            ids_str+=this.value+","
          }
        });
        ids_str = ids_str.substring(0, ids_str.length - 1);
        $(this).attr("disabled","true");
        var json = {command:"create_order",params:{"id":ids_str}}
        send_query(json,function(result){
          if($(result).find("rc").text() == 0){
            //alert("Ok \n Заказанно "+ids.length+" билета. На сумму:"+$(".amount").html());
            formpay(result);
          } 
          else {
            alert("Что-то не так")
          }
        });
      })
      //'onclick'=>'myplace.checkPlace(this)'
    });
  }); 
}

function formpay(result){
  //alert("Переходим к оплате!");
  var values = {};
  //value['rc'] = $(result).find("rc").text();
  /*
  merchant ID 10
  product ID 3790
  secret word sw
  пуляйте
  */
  var merchant_id = "10";
  var product_id = "3790";
  var secret_word = "sw";
  values['merchant_id'] = merchant_id;
  values['product_id'] = product_id;
  values['secret_word'] = secret_word;
  values['amount'] = $(".amount").html();
  values['cf'] = $(result).find("id").text();
  values['cf2'] = $(result).find("PRICE").text();

  values['cb_url'] = "http://81.200.5.254:888/cgi-bin/acqp_callback";
  values['ok_url'] = "http://192.168.1.101/content/scene_test/paymay_ok.html";
  values['ko_url '] = "http://192.168.1.101/content/scene_test/paymay_ko.html";

  /* -- Информация о клиенте для тестов -- */
  values['first_name'] = "TEST";
  values['last_name'] = "TEST";
  values['email'] = "st.nksp@gmail.com";
  values['phone'] = "7123456789";
  values['country'] = "Россия";
  values['region'] = "Москва";
  values['city'] = "Москва";
  values['address'] = "Россия";
  values['cardholder'] = "TEST TEST";
  values['exp_nomth'] = "12";
  values['exp_year'] = "2015";
  /*

  
  
  

  
  */
  /*
  
  */

  //values['pan'] = "4000000000000002";
  /*
  var url = "http://192.168.1.101/content/scene/paymay.html";
  var new_win = window.open(url);
  new_win.document.write("test");
  */

  /*
  values['pan'] = 4000000000000002;
  values['cvv'] = 123;
  
  values['exp_nomth'] = 12;
  values['exp_year'] = 2013;
  values['cardholder'] = "DARTH VADER";
  values['language'] = "en";
  */
  
  var t = merchant_id + product_id + values['amount'] + values['cf'] + secret_word;
  //values['token'] = Crypto.MD5(t);
  values['token'] = $(result).find("token").text();

  

  var html = "";
  for(key in values){
    html+= '<input type="hidden" name="'+key+'" value="'+values[key]+'" />';
  }
  //html+= '<button> OK </button>';
  $("#FormPay").html(html);
  $("#FormPay").submit();



  /* Эксперемент с фраймом */
  //$(".ModalWin").show("fast");
  //$("#frame_pay").attr("src","https://secure.acquiropay.com/")
  //$("#FormPay").submit();

  //$("#frame_pay").contents().find("#FormPay").html(html);
  //$("#frame_pay").contents().find("#FormPay").submit();
  //merchant_id + product_Id + amount + cf +cf2 + cf3 + secret_word

  //alert($(result).find("rc").text());
}