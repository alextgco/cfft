function E(id) {
 	var e = document.getElementById(id);
 	if(e) return e;
 	return null;
}

function setCookie(name, value, expire, path) {
	if(expire) {
		var expireDate = new Date();
		expireDate.setDate(expire + expireDate.getDate());
		
		document.cookie = name + "=" + value + ";" + " expires=" + expireDate.toGMTString() + ";" + " path=" + path + ";";
	} else {
		document.cookie = name + "=" + value + ";" + " path=/;";
	}
}

// plugin playlast
(function($) {
	var queuecounter = {};
	$.playLast = function(fn, delay, queue) {
		if(!queue) queue = 'default';
		if(!queuecounter[queue]) queuecounter[queue] = 0;
		
		queuecounter[queue]++;
		var inner = queuecounter[queue];
		
		var ff = function() {
			if(inner != queuecounter[queue]) return false;
			fn();
		}
		setTimeout(ff, delay);
	}
})(jQuery);

// plugin touchHandler
(function($) {
	if(!document.addEventListener || !document.createEvent) return;
	
	var clickms = 200;
	var lastTouchDown = -1;

	function touchHandler(event) {
		 var touches = event.changedTouches,
		    first = touches[0],
		    type = "";

		 var d = new Date();
		 switch(event.type)	{
		    case "touchstart": type = "mousedown"; lastTouchDown = d.getTime(); break;
		    case "touchmove": type="mousemove"; lastTouchDown = -1; break;        
		    case "touchend": if(lastTouchDown > -1 && (d.getTime() - lastTouchDown) < clickms){lastTouchDown = -1; type="click"; break;} type="mouseup"; break;
		    default: return;
		}
		var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1,
		                          first.screenX, first.screenY,
		                          first.clientX, first.clientY, false,
		                          false, false, false, 0, null);

		first.target.dispatchEvent(simulatedEvent);
		event.preventDefault();
	}

	function init()	{
	   document.addEventListener("touchstart", touchHandler, true);
	   document.addEventListener("touchmove", touchHandler, true);
	   document.addEventListener("touchend", touchHandler, true);
	   document.addEventListener("touchcancel", touchHandler, true);
	}
	
	//$(init);
})(jQuery);

var CMS = new function() {

	var CMS = this;
	
	CMS.runScripts = function(html) {
		if(!html) return;
		
		/*html = html.replace(/\<script/g, '<div class="ajaxscript"');
		html = html.replace(/\/script\>/g, '/div>');*/
		
		html = html.replace(/\/\*\<\!\[CDATA\[\*\//g, '');
		html = html.replace(/\/\*\]\]\>\*\//g, '');

		var scriptfiles = [];
		var scripts = [];

        var mat;
        var mat2;
        //var re = /\<script([^>]*)\>([^]*?)\<\/script/gim;
        var re = /\<script([^>]*)\>([^\v]*?)\<\/script/gim;
        var re2 = /src="([^"]*)"/i;
        while((mat = re.exec(html)) != null) {
            if(mat[1]) {
                if(mat2 = re2.exec(mat[1])) {
                    scriptfiles.push(mat2[1]);
                }
            }
            if(mat[2]) {
                scripts.push(mat[2]);
            }
        }
		
		//$('.ajaxscript', '<div>'+html+'</div>').each(function(index, element) {var src = $(element).attr('src'); if(src) scriptfiles.push(src); else if(element.innerHTML) scripts.push(element.innerHTML);});
	
		if(scriptfiles.length) {
			$.requireScript(scriptfiles, function() {
				if(scripts.length)
				for(i in scripts) {
					jQuery.globalEval(scripts[i]);
				}
			}, window);
		} else {
			if(scripts.length)
			for(i in scripts) {
				jQuery.globalEval(scripts[i]);
			}
		}
	}

    CMS.addToSelect = function(oSelect, name, value) {
        if(!oSelect.options) {
            oSelect = E(oSelect);
        }

        if(oSelect.options) {
            var oOption = document.createElement("OPTION");
            oSelect.options.add(oOption);
            oOption.innerHTML = name;
            oOption.value = value;
        }
    }

	CMS.setLanguge = function(language) {
		setCookie('language', language);
        location.href = '/';
		
		/*if(lastajax) {
			CMS.doAjax(lastajax['url'], lastajax['id'], lastajax['data']);
		} else {
			var e = E('languagepostdata');
			if(e && e.value) {
				CMS.doPost(location.href, {'postdata':e.value});
			} else {
				location.reload(true);
			}
		}*/
	}

	CMS.doPost = function(url, postdata) {
		var form = document.createElement('form');
		form.setAttribute('method', 'post');
		form.setAttribute('action', url);
		
		var input;
		
		for(key in postdata) {
			input = document.createElement('input');
			input.setAttribute('type', 'hidden');
			input.setAttribute('name', key);
			input.setAttribute('value', postdata[key]);
			form.appendChild(input);
		}
		
		form = document.body.appendChild(form);
		
		form.submit();
	}

	CMS.sendPost = function(url, postdata) {
		$(document).ready(function() {
			doPost(url, postdata);
		});
	}

	// обрамляет элемент, превращая его в popup
	CMS.popupElement = function(e, classname) {
		if(!e) return false;

		var id = e.id;
		var content = '<div id="'+id+'">'+e.innerHTML+'</div>';
		$(e).remove();

		CMS.showPopup(classname, content);
	}

	CMS.popupFrame = function(url, classname) {
		var content = '<iframe style="width:100%;height:100%;border:none" frameborder="0" src="'+url+'"></iframe>';
		CMS.showPopup(classname, content);
	}

	CMS.showPopup = function(classname, popupcontent, onclose, popupid) {
        if(!popupid) popupid = 'popupwindow';

		if (E(popupid)) document.body.removeChild(E(popupid));
	
		var div_popup = document.createElement('div');
		div_popup.id = popupid;
		div_popup.className = 'fixed';
		div_popup.style.width = '100%';
		div_popup.style.height = '100%';
		div_popup.style.left = '0';
		div_popup.style.top = '0';
		div_popup.style.zIndex = '1000';
		document.body.appendChild(div_popup);
		
		var div_overlay = document.createElement('div');
		div_overlay.className = 'fixed overlay';
		div_overlay.style.width = '100%';
		div_overlay.style.height = '100%';
		div_overlay.style.left = '0';
		div_overlay.style.top = '0';
		div_overlay.style.zIndex = '1000';
		div_popup.appendChild(div_overlay);
		
		var div = document.createElement('div');
		div.id = 'close';
		div.className = 'fixed'+(classname?' '+classname:'');
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.left = '0';
		div.style.top = '0';
		div.style.zIndex = '1000';
		div.style.textAlign = 'center';
		div.style.verticalAlign = 'middle';
		div.innerHTML = '<table class="h"><tr><td id="close"><div class="popupwindow" style="vertical-align:middle;display:inline-block;//display:inline;zoom:1"><div class="popupclose"><a href="javascript:void(0)" id="close"><img id="close" src="/img/close.png" border=0></a></div><div id="popupcontent" style="text-align:left">'+(popupcontent ? popupcontent : '<div style="text-align:center;height:50px"><div style="margin-left:-1px;width:1px;height:100%;vertical-align:middle;display:inline-block;//display:inline;zoom:1"></div><img style="vertical-align:middle" src="/img/preloader2.gif" border="0"></div>')+'</div></div></td></tr></table>';
		div = div_popup.appendChild(div);

        var popupcontent = $(div).find('#popupcontent');
        popupcontent.css('maxHeight', Math.round($(window).height()*0.8));

		div.onclick = function(e) {
			if(!document.all) {
				var target = e.target;
			} else {
				var target = event.srcElement;
			}
			
			if(target.id=='close') {
				CMS.hidePopup(popupid);
				
				if(onclose) {
					onclose();
				}
			}
		};
	}

	CMS.hidePopup = function(popupid) {
        if(!popupid) popupid = 'popupwindow';
		if (E(popupid)) document.body.removeChild(E(popupid));
	}

	var g_curhiderid = 0;

	CMS.showHider = function(time, classname, nopreloader) {
		g_curhiderid++;
		
		if(time) {
			setTimeout("CMS.hideHider('" + g_curhiderid + "')", time);
		}
		
		var div_hider = document.createElement('div');
		div_hider.id = 'ajaxhider';
		div_hider.className = 'fixed';
		div_hider.style.width = '100%';
		div_hider.style.height = '100%';
		div_hider.style.left = '0';
		div_hider.style.top = '0';
		div_hider.style.zIndex = '9999';
		document.body.appendChild(div_hider);
		
		var div_overlay = document.createElement('div');
		div_overlay.className = 'fixed overlay';
		div_overlay.style.width = '100%';
		div_overlay.style.height = '100%';
		div_overlay.style.left = '0';
		div_overlay.style.top = '0';
		div_overlay.style.zIndex = '9999';
		div_hider.appendChild(div_overlay);
		
		var div = document.createElement('div');
		div.id = 'close';
		div.className = 'fixed'+(classname?' '+classname:'');
		div.style.width = '100%';
		div.style.height = '100%';
		div.style.left = '0';
		div.style.top = '0';
		div.style.zIndex = '9999';
		div.style.textAlign = 'center';
		div.style.verticalAlign = 'middle';
		div.innerHTML = '<table class="h"><tr><td valign="middle" align="center">'+(nopreloader ? '' : '<img src="/img/preloader2.gif" border="0">')+'</td></tr></table>';
		div = div_hider.appendChild(div);
		
		return g_curhiderid;
	}

	CMS.hideHider = function(id) {
		if(id == g_curhiderid || !id) {
			if (E('ajaxhider')) document.body.removeChild(E('ajaxhider'));
		}
	}

	var g_isie6 = 0;

	function isIE6() {
		if(g_isie6) {
	 		if(g_isie6 == 1) return true;
	 		else if(g_isie6 == 2) return false;
		}
		
		var browser=navigator.appName;
		var b_version=navigator.appVersion;
		
		var re = new RegExp('; MSIE 6\.*;', "gim");

		if(b_version.search(re) != -1) {
			g_isie6 = 1;
			return true;
		} else {
			g_isie6 = 2;
			return false;
		}
	}

	function getElementsByClass(searchClass,node,tag) {
		var classElements = new Array();
		if ( node == null )
				node = document;
		if ( tag == null )
				tag = '*';
		var els = node.getElementsByTagName(tag);
		var elsLen = els.length;
		var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
		for (i = 0, j = 0; i < elsLen; i++) {
			if ( pattern.test(els[i].className) ) {
				classElements[j] = els[i];
				j++;
			}
		}
		return classElements;
	}

	CMS.myscroll = function() {
		var top = self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
		var left = self.pageXOffset || (document.documentElement && document.documentElement.scrollLeft) || (document.body && document.body.scrollLeft);
		var m_fixed_elements = getElementsByClass('fixed');
		for(i=0;i<m_fixed_elements.length;i++) {
			var fixedtop = m_fixed_elements[i].getAttribute('fixedtop');
			if(!fixedtop) {
				fixedtop = parseInt(m_fixed_elements[i].style.top);
				if (!fixedtop) fixedtop = 0;
				if (fixedtop == 0) fixedtop = 'zero';
				m_fixed_elements[i].setAttribute('fixedtop', fixedtop);
			}
			if (!fixedtop) fixedtop = 0;
			if (fixedtop == 'zero') fixedtop = 0;
			m_fixed_elements[i].style.top = (fixedtop + top) + 'px';
			
			var fixedleft = m_fixed_elements[i].getAttribute('fixedleft');
			if(!fixedleft) {
				fixedleft = parseInt(m_fixed_elements[i].style.left);
				if (!fixedleft) fixedleft = 0;
				if (fixedleft == 0) fixedleft = 'zero';
				m_fixed_elements[i].setAttribute('fixedleft', fixedleft);
			}
			if (!fixedleft) fixedleft = 0;
			if (fixedleft == 'zero') fixedleft = 0;
			m_fixed_elements[i].style.left = (fixedleft + left) + 'px';
		}
	}

	if(isIE6()) window.onscroll = CMS.myscroll;

	CMS.registerLoadedScripts = function() {
		$('script').each(function(index, element){
			var src = $(element).attr('src');
			if(src) {
				$.requireScript.registerLoaded(src);
			}
		});
	}

	var lastajax = {};

	CMS.doAjax = function(url, targetid, post, onerror, onsuccess, sourceid, hiderclass) {
		if(typeof url == 'object') {
			var hash = url;
			url = hash['url'];
			targetid = hash['targetid'];
			post = hash['post'];
			onerror = hash['onerror'];
			onsuccess = hash['onsuccess'];
			sourceid = hash['sourceid'];
			hiderclass = hash['hiderclass'];
		}
		
		if(!targetid) targetid = 'content';
		if(!sourceid) sourceid = targetid;
		if(!hiderclass && hiderclass!==false) hiderclass = 'hider';
		
		lastajax['url'] = url;
		lastajax['data'] = post;
		lastajax['id'] = targetid;
		
		var hiderid = 0;
		if(hiderclass) hiderid = CMS.showHider(null, hiderclass);

        var type = 'get';
        if(post) type = 'post';
		
		$.ajax({
			'url':url,
			'data':post,
			'dataType':'html',
			'cache':false,
            'type':type,
			'success':function(html, textStatus, jqXHR) {
				if(html.length>1) {
					if(parseAjaxRes(html)) return true;

                    CMS.registerLoadedScripts();

					var content = $('#'+sourceid,'<div>'+html+'</div>').html();
					if(content) E(targetid).innerHTML = content;
					else E(targetid).innerHTML = html;

					CMS.runScripts(html);
				}
				if(hiderid) CMS.hideHider(hiderid);
				if(onsuccess) onsuccess();
			},
			'error':function(jqXHR, textStatus, errorThrown) {
				if(onerror) {
					onerror();
				} else
				if(jqXHR && jqXHR.responseText) {
					alert(jqXHR.responseText);
				} else {
					//alert('Error');
				}
			}
		});
	}
	
	CMS.ajaxPopup = function(url, sourceid, classname, post, onclose, onerror) {
		if(typeof url == 'object') {
			var hash = url;
			url = hash['url'];
			sourceid = hash['sourceid'];
			classname = hash['classname'];
			post = hash['post'];
			onclose = hash['onclose'];
			onerror = hash['onerror'];
		}
		
		if(!sourceid) sourceid = 'content';
		
		CMS.showPopup(classname, null, onclose);
		CMS.doAjax(url, 'popupcontent', post, onerror, null, sourceid, false);
	}
	
	function haveFileField($form) {
		if($form.find('input[type=file]').length>0) return true;
		else return false;
	}
	
	CMS.ajaxSendForm = function(form, targetid, onerror, sourceid) {
		if(!form) return true;
		if(form instanceof Object) {
			$form = $(form);
		} else {
			$form = $('#'+form);
		}
		if(!$form) return true;
		
		if(!sourceid) sourceid = 'content';
		
		var post = $form.serializeArray();
		CMS.doAjax($form.attr('action'), targetid, post, onerror, null, sourceid);
	
		return false;
	}
	
	CMS.ajaxSendPopupForm = function(form, sourceid, classname, onclose, onerror) {
		/*if(typeof form == 'object' && form['form']) {
			var hash = form;
			form = hash['form'];
			sourceid = hash['sourceid'];
			classname = hash['classname'];
			onclose = hash['onclose'];
			onerror = hash['onerror'];
		}*/
		
		if(!form) return true;
		if(form instanceof Object) {
			$form = $(form);
		} else {
			$form = $('#'+form);
		}
		if(!$form) return true;
		
		var post = $form.serializeArray();
		
		if(!sourceid) sourceid = 'content';
		
		CMS.showPopup(classname, null, onclose);
		CMS.doAjax($form.attr('action'), 'popupcontent', post, onerror, null, sourceid, false);
		
		return false;
	}

	function getJson(str) {
		if(str && (str.indexOf('{')==0 || str.indexOf('{')==1)) {
			str = '(' + str + ')';
			var json = null;
			eval('json = ' + str);
			return json;
		}
		return false;
	}

	function parseAjaxRes(html) {
		var json = getJson(html);
		
		if(json) {
			if(json['redirect']) {
				if(json['postdata']) {
					CMS.sendPost(json['redirect'], json['postdata']);
				} else {
					location.replace(json['redirect']);
				}
				return true;
			} else
			if(json['error']) {
				alert(json['error']);
				return true;
			}
		}
	}

	CMS.Dialog = new function () {
        this.create = function (dialogurl, startwidth, startheight) {
            var root = getRootWindow();
            if (root != window) root.CMS.Dialog.create(dialogurl, startwidth, startheight);
            var document = root.document;

            if (!$(document).find('link[href="/css/dialogwindow.css"]').length) {
                var link = document.createElement('link');
                link.href = '/css/dialogwindow.css';
                link.rel = 'stylesheet';
                link.type = 'text/css';
                document.head.appendChild(link);
            }

            $.requireScript('/js/dialogwindow.js', function () {
                createWindowDialog(dialogurl, startwidth, startheight);
            }, this);
        }

        this.close = function () {
            this.getCurrentDialog().closeWindow();
        }

        this.getRootWindow = function () {
            return getRootWindow();
        }

        this.onClose = function () {
            var root = getRootWindow();
            if (root != window) return root.CMS.Dialog.onClose();

            g_dialogcount--;
            g_m_dialogconteiner.pop();
        }

        var g_dialogcount = 0;
        var g_m_dialogconteiner = [];

        this.getCurrentDialog = function (win) {
            var root = getRootWindow();
            if (root != window) return root.CMS.Dialog.getCurrentDialog(window);

            if (!win) win = window;

            for (var i = 0; i < g_m_dialogconteiner.length; i++) {
                if (g_m_dialogconteiner[i]) {
                    var cur = g_m_dialogconteiner[i];
                    if (cur && cur.getWindow() == win) return cur;
                }
            }
            return false;
        }

        // возвращает номер текущего диалога в глобальном массиве диалогов
        this.currentDialogNum = function (win) {
            var root = getRootWindow();
            if (root != window) return root.CMS.Dialog.currentDialogNum(window);

            if (!win) win = window;

            for (var i = 0; i < g_m_dialogconteiner.length; i++) {
                if (g_m_dialogconteiner[i]) {
                    var cur = g_m_dialogconteiner[i];
                    if (cur && cur.getWindow() == win) return i;
                }
            }

            return -1;
        }

        function getRootWindow() {
            var win = window;
            while (win.parent && win.parent != win) {
                win = win.parent;
            }
            return win;
        }

        this.getParentDialog = function (win) {
            var root = getRootWindow();
            if (root != window) return root.CMS.Dialog.getParentDialog(window);

            if (!win) win = window;

            return g_m_dialogconteiner[this.currentDialogNum(win) - 1];
        }

        var dialogWindowReLoaded = new Array();

        function createWindowDialog(dialogurl, startwidth, startheight) {
            var dialogframe;
            var root = getRootWindow();
            //if (root != window) return root.createWindowDialog(dialogurl);

            try {
                if (!$(window).dialogWin) return false;

                g_dialogcount++;

                var iframeId = 'dialogframe' + g_dialogcount;
                dialogWindowReLoaded[iframeId] = false;
                var iframe = '<iframe id="' + iframeId + '" src="' + dialogurl + '" border="0" frameborder="0" style="width:100%;height:100%;"></iframe>';
                $(document.body).append(iframe);
                dialogframe = $(document.getElementById(iframeId));

                dialogframe.dialogWin({
                    closeBtn:true,
                    refreshBtn:true,
                    maxBtn:true,
                    preloader:true,
                    preloaderSrc:'/img/preloader2.gif',
                    sizeable:true
                }).hideWindow();

                dialogframe.load(getOnLoad(dialogframe));
                g_m_dialogconteiner.push(dialogframe);

                try {
                    myscroll()
                } catch (er) {
                }

            } catch (e) {
                return false;
            }

            return true;

            function getOnLoad(dialogframe) {
                return function (e) {
                    var frame = e.target;
                    dialogframe.showWindow();

                    var caption = $(frame.contentWindow.document).find('title').html();
                    if (caption.length > 40) caption = caption.substr(0, 37) + '...';

                    var obj = $(frame.contentWindow.document);

                    /*var content = obj.find('#content');
                     if(content.length) {
                     content.css('margin', '10px');
                     $(frame.contentWindow.document.body).html(content);
                     }*/
                    var body = $(frame.contentWindow.document.body);
                    body.find('.navbar').css('display', 'none');
                    body.find('.breadcrumbs').css('display', 'none');

                    var width = obj.width();
                    var height = obj.height();

                    if (width < startwidth) width = startwidth;
                    if (height < startheight) height = startheight;

                    var disableSizeable = false;

                    dialogframe
                        .setWindowSize(width, height, true)
                        .css('width', '100%')
                        .css('height', '100%')
                        .css('opacity', 1)
                        .hidePreloader()
                        .setCaption(caption);
                    if (disableSizeable) {
                        dialogframe.setSizeable(false);
                    }
                    dialogWindowReLoaded[frame.id] = true;
                }
            }
        }
    };

    CMS.showEditorInFrame = function(frame) {
        if(!(frame instanceof HTMLIFrameElement)) {
            frame = E(frame);
        }

        if(!frame) return;

        var win = frame.contentWindow;
        var doc = win.document;

        doc.write('<html><head><script type="text/javascript" src="/js/jquery.requireScript-1.2.1.js"></script></head><body></body></html>');

        var body = doc.body;

        body.style.margin = 0;
        body.style.padding = 0;

        body.innerHTML = '<link rel="stylesheet" type="text/css" href="/pub/E5/panel.css" /><link rel="stylesheet" type="text/css" href="/pub/E5/htmleditor.css" /><div id="content"></div><script>E5config().imgurl="/pub/E5/img";E5editor().edit("content", "");</script>';
    }

    CMS.getPageSize = function() {
        var xScroll, yScroll;
        if (window.innerHeight && window.scrollMaxY) {
            xScroll = window.innerWidth + window.scrollMaxX;
            yScroll = window.innerHeight + window.scrollMaxY;
        } else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
            xScroll = document.body.scrollWidth;
            yScroll = document.body.scrollHeight;
        } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
            xScroll = document.body.offsetWidth;
            yScroll = document.body.offsetHeight;
        }
        var windowWidth, windowHeight;
        if (self.innerHeight) {     // all except Explorer
            if(document.documentElement.clientWidth){
                windowWidth = document.documentElement.clientWidth;
            } else {
                windowWidth = self.innerWidth;
            }
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowWidth = document.documentElement.clientWidth;
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowWidth = document.body.clientWidth;
            windowHeight = document.body.clientHeight;
        }
        // for small pages with total height less then height of the viewport
        if(yScroll < windowHeight){
            pageHeight = windowHeight;
        } else {
            pageHeight = yScroll;
        }
        // for small pages with total width less then width of the viewport
        if(xScroll < windowWidth){
            pageWidth = xScroll;
        } else {
            pageWidth = windowWidth;
        }
        arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight);
        return arrayPageSize;
    };

    var g_isie6 = 0;

    CMS.isIE6 = function() {
        if(g_isie6) {
            if(g_isie6 == 1) return true;
            else if(g_isie6 == 2) return false;
        }

        var browser=navigator.appName;
        var b_version=navigator.appVersion;

        var re = new RegExp('; MSIE 6\.*;', "gim");

        if(b_version.search(re) != -1) {
            g_isie6 = 1;
            return true;
        } else {
            g_isie6 = 2;
            return false;
        }
    }

};

var showfoto = (function() {
    var showing_image;
    var showing_overlay;
    var showing_closebtn;
    var showing_image_alpha = 0;
    var showing_preloader;
    var showing_preloader_div;
    var preloaderImagePosition = 0;
    var preloaderIntervalID = 0;
    var showing_isIE = (navigator.appVersion.indexOf('MSIE') > 0) ? true : false;

    var showfoto = function(x, y, url) {
        if (window.editor && editor.element) return;

        var isIE = (navigator.appVersion.indexOf('MSIE') > 0) ? true : false;

        var pagesize = CMS.getPageSize();

        var onclick = function () {
            var i;
            if (showing_overlay) {
                for (i in document.body.childNodes) {
                    if (document.body.childNodes.item(i) == showing_overlay)
                        document.body.removeChild(showing_overlay);
                }
                showing_overlay = null;
            }
            if (showing_preloader_div) {
                for (i in document.body.childNodes) {
                    if (document.body.childNodes.item(i) == showing_preloader_div)
                        document.body.removeChild(showing_preloader_div);
                }
                showing_preloader_div = null;
            }
            if (showing_closebtn) {
                for (i in document.body.childNodes) {
                    if (document.body.childNodes.item(i) == showing_closebtn)
                        document.body.removeChild(showing_closebtn);
                }
                showing_closebtn = null;
            }
            if (showing_image) {
                for (i in document.body.childNodes) {
                    if (document.body.childNodes.item(i) == showing_image)
                        document.body.removeChild(showing_image);
                }

                showing_image = null;
            }
            if (preloaderIntervalID) {
                clearInterval(preloaderIntervalID);
                preloaderIntervalID = 0;
            }
        }

        showing_overlay = document.createElement('div');
        showing_overlay.id = 'showfoto-overlay';
        showing_overlay.className = 'fixed';
        showing_overlay.style.width = '100%';
        showing_overlay.style.height = '100%';
        showing_overlay.style.top = '0px';
        showing_overlay.style.left = '0px';
        showing_overlay.style.backgroundColor = '#000000';
        showing_overlay.style.zIndex = '1000';
        showing_overlay.onclick = onclick;
        document.body.appendChild(showing_overlay);

        showing_preloader = document.createElement('img');
        showing_preloader.style.display = 'block';
        showing_preloader_div = document.createElement('div');
        showing_preloader_div.className = 'fixed';
        showing_preloader_div.style.zIndex = '1001';
        showing_preloader_div.style.overflow = 'hidden';
        showing_preloader_div.onclick = onclick;
        showing_preloader_div.appendChild(showing_preloader);
        document.body.appendChild(showing_preloader_div);

        showing_preloader.onload = function () {
            showing_preloader.onload = null;
            showing_preloader.style.width = showing_preloader.width + 'px';
            showing_preloader.style.height = showing_preloader.height + 'px';
            showing_preloader_div.style.width = showing_preloader.width + 'px';
            showing_preloader_div.style.height = showing_preloader.width + 'px';
            showing_preloader_div.style.top = ((pagesize[3] - showing_preloader.width) / 2) + 'px';
            showing_preloader_div.style.left = ((pagesize[2] - showing_preloader.width) / 2) + 'px';

            if (CMS.isIE6()) {
                showing_preloader.src = '/img/spacer.gif';
                showing_preloader.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='img/preloader.png', sizingMethod='scale')";
            }

            preloaderIntervalID = setInterval('showPreloaderOnTimer('+showing_preloader.width+', '+showing_preloader.height+')', 60);
        }
        showing_preloader.src = 'img/preloader.png';

        if (isIE) {
            showing_overlay.style.filter ="progid:DXImageTransform.Microsoft.Alpha(opacity=50)";
        } else {
            showing_overlay.style.opacity = '0.5';
        }

        showing_image = document.createElement('img');
        showing_image.onload = function () {
            var imgwidth = showing_image.width;
            var imgheight = showing_image.height;

            if (pagesize[2] < showing_image.width + 30 || pagesize[3] < showing_image.height + 30) {
                imgwidth = pagesize[2] - 30;
                imgheight = showing_image.height * imgwidth / showing_image.width;
                if (imgheight > pagesize[3] - 30) {
                    imgheight = pagesize[3] - 30;
                    imgwidth = showing_image.width * imgheight / showing_image.height;
                }
                showing_image.style.width = Math.round(imgwidth) + 'px';
                showing_image.style.height = Math.round(imgheight) + 'px';
                //alert(showing_image.style.width + ' x ' + showing_image.style.height)
            }

            showing_image.className = 'fixed';
            showing_image.style.left = (pagesize[2] - imgwidth) / 2 + 'px';
            showing_image.style.top = (pagesize[3] - imgheight) / 2 + 'px';
            showing_image.style.border = '5px solid #FFF';
            showing_image.style.backgroundColor = "#FFF";
            showing_image.style.zIndex = '1001';
            showing_image_alpha = 0;
            document.body.appendChild(showing_image);

            showing_closebtn = document.createElement('img');
            showing_closebtn.style.width = '30px';
            showing_closebtn.style.height = '30px';
            if (CMS.isIE6()) {
                showing_closebtn.src = '/img/spacer.gif';
                showing_closebtn.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='/img/close.png', sizingMethod='scale')";
            } else {
                showing_closebtn.src = '/img/close.png';
            }
            showing_closebtn.className = 'fixed';
            showing_closebtn.style.left = ((pagesize[2] + imgwidth) / 2 - 5) + 'px';
            showing_closebtn.style.top = ((pagesize[3] - imgheight) / 2 - 15) + 'px';
            showing_closebtn.style.cursor = 'pointer';
            showing_closebtn.style.zIndex = '1002';
            document.body.appendChild(showing_closebtn);

            showing_image.onclick = onclick;
            showing_closebtn.onclick = onclick;

            CMS.myscroll();

            if (isIE) {
                showing_image.style.filter ="progid:DXImageTransform.Microsoft.Alpha(opacity=0)";
            } else {
                showing_image.style.opacity = '0';
                showing_closebtn.style.opacity = '0';
            }

            showfotoontimer();
            showing_preloader_div.style.display = 'none';
            if (preloaderIntervalID) {
                clearInterval(preloaderIntervalID);
                preloaderIntervalID = 0;
            }
        }

        showing_image.src = url;
    }

    function showPreloaderOnTimer(width, height) {
        preloaderImagePosition += width;
        if (preloaderImagePosition >= height) preloaderImagePosition = 0;
        if (showing_preloader) showing_preloader.style.marginTop = '-' + preloaderImagePosition + 'px';
    }

    function showfotoontimer() {
        showing_image_alpha = showing_image_alpha + 5;

        if(showing_image) {
            if (showing_isIE) {
                showing_image_alpha = showing_image_alpha + 15;
                showing_image.style.filter ="progid:DXImageTransform.Microsoft.Alpha(opacity="+showing_image_alpha+")";
            } else {
                showing_image.style.opacity = showing_image_alpha / 100;
                showing_closebtn.style.opacity = showing_image_alpha / 100;
            }
        }

        if (showing_image_alpha < 100) {
            var tf = function() {
                showfotoontimer();
            }
            setTimeout(tf, 30);
        }
    }

    return showfoto;
})();
