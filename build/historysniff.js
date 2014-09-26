/*! historysniff.js - 0.0.1 - 2014-09-25 - motdotla */
var MicroEvent  = function(){};
MicroEvent.prototype  = {
  bind  : function(event, fct){
    this._events = this._events || {};
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
  },
  unbind  : function(event, fct){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
  },
  trigger : function(event /* , args... */){
    this._events = this._events || {};
    if( event in this._events === false  )  return;
    for(var i = 0; i < this._events[event].length; i++){
      this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
    }
  }
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin  = function(destObject){
  var props = ['bind', 'unbind', 'trigger'];
  for(var i = 0; i < props.length; i ++){
    if( typeof destObject === 'function' ){
      destObject.prototype[props[i]]  = MicroEvent.prototype[props[i]];
    }else{
      destObject[props[i]] = MicroEvent.prototype[props[i]];
    }
  }
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
  module.exports  = MicroEvent;
}


(function(exports){

  var websites;
  var wrapper;
  var maximum_ms_response_if_cached = 50;

  var setupLoop = function() {
    window.addEventListener("message", wrapper, false);
  };

  var runLoop = function() {
    window.postMessage('', '*');
  };

  var tearDownLoop = function() {
    window.removeEventListener("message", wrapper, false);
  };

  var imgAlreadyCached = function(img, start, cb) {
    var now = new Date().getTime();
    var current_expired_ms = now - start;

    if (img.complete) {
      delete img;
      tearDownLoop();

      cb(true); // it had likely been cached previous
    } else if (current_expired_ms > maximum_ms_response_if_cached) {
      delete img;
      window.stop();
      tearDownLoop();

      cb(false); // it had likely not been cached previous because it took too long to load
    }

    runLoop();
  };

  function checkUrl(url, cb) {
    var img   = new Image();
    var start = new Date().getTime();
    img.src   = url;

    wrapper   = function() { 
      imgAlreadyCached(img, start, function(true_or_false) { 
        cb(true_or_false);
      });
    };

    setupLoop();
    runLoop();
  }

  function checkLastWebsite(_this) {
    var website = websites.pop();
    checkUrl(website.url, function(result) {
      if (result === true) {
        _this.trigger('match', website);
      } else {
        _this.trigger('nomatch', website);
      }

      if (websites.length > 0) {
        checkLastWebsite(_this);
      }
    });
  }

  var Historysniff = function() {
    return this;
  };

  Historysniff.prototype.check = function(data) {
    websites = data;
    checkLastWebsite(this);
  };

  MicroEvent.mixin(Historysniff);
  exports.historysniff = new Historysniff();

})(window);
