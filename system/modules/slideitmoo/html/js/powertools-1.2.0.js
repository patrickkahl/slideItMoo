/**
 * packager build Custom-Event/* Mobile/Browser.Mobile Mobile/Browser.Features.Touch Mobile/Swipe
 * license: MIT-style license.
 * 
 * @copyright  Christoph Pojer (@cpojer)
 * @package    Frontend
 */
(function(){[Element,Window,Document].invoke("implement",{hasEvent:function(f){var e=this.retrieve("events"),g=(e&&e[f])?e[f].values:null;if(g){var d=g.length;while(d--){if(d in g){return true}}}return false}});var c=function(e,f,d){f=e[f];d=e[d];return function(h,g){if(d&&!this.hasEvent(g)){d.call(this,h,g)}if(f){f.call(this,h,g)}}};var a=function(e,d,f){return function(h,g){d[f].call(this,h,g);e[f].call(this,h,g)}};var b=Element.Events;Element.defineCustomEvent=function(d,f){var e=b[f.base];f.onAdd=c(f,"onAdd","onSetup");f.onRemove=c(f,"onRemove","onTeardown");b[d]=e?Object.append({},f,{base:e.base,condition:function(h,g){return(!e.condition||e.condition.call(this,h,g))&&(!f.condition||f.condition.call(this,h,g))},onAdd:a(f,e,"onAdd"),onRemove:a(f,e,"onRemove")}):f;return this};Element.enableCustomEvents=function(){Object.each(b,function(e,d){if(e.onEnable){e.onEnable.call(e,d)}})};Element.disableCustomEvents=function(){Object.each(b,function(e,d){if(e.onDisable){e.onDisable.call(e,d)}})}})();(function(){Browser.Device={name:"other"};if(Browser.Platform.ios){var a=navigator.userAgent.toLowerCase().match(/(ip(ad|od|hone))/)[0];Browser.Device[a]=true;Browser.Device.name=a}if(this.devicePixelRatio==2){Browser.hasHighResolution=true}Browser.isMobile=!["mac","linux","win"].contains(Browser.Platform.name)}).call(this);Browser.Features.Touch=(function(){try{document.createEvent("TouchEvent").initTouchEvent("touchstart");return true}catch(a){}return false})();Browser.Features.iOSTouch=(function(){var a="cantouch",c=document.html,f=false;if(!c.addEventListener){return false}var d=function(){c.removeEventListener(a,d,true);f=true};try{c.addEventListener(a,d,true);var e=document.createEvent("TouchEvent");e.initTouchEvent(a);c.dispatchEvent(e);return f}catch(b){}d();return false})();(function(){var a="swipe",c=a+":distance",f=a+":cancelVertical",g=50;var b={},e,d;var h=function(){d=false};var i={touchstart:function(j){if(j.touches.length>1){return}var k=j.touches[0];d=true;b={x:k.pageX,y:k.pageY}},touchmove:function(l){if(e||!d){return}var p=l.changedTouches[0],j={x:p.pageX,y:p.pageY};if(this.retrieve(f)&&Math.abs(b.y-j.y)>10){d=false;return}var o=this.retrieve(c,g),n=j.x-b.x,m=n<-o,k=n>o;if(!k&&!m){return}l.preventDefault();d=false;l.direction=(m?"left":"right");l.start=b;l.end=j;this.fireEvent(a,l)},touchend:h,touchcancel:h};Element.defineCustomEvent(a,{onSetup:function(){this.addEvents(i)},onTeardown:function(){this.removeEvents(i)},onEnable:function(){e=false},onDisable:function(){e=true;h()}})})();