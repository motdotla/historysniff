(function(exports){

  var apps;
  var wrapper;

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
    } else if (current_expired_ms > historysniff.ms_measurement) {
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

  function checkLastApp() {
    var app = apps.pop();
    checkUrl(app.url, function(result) {
      if (result === true) {
        historysniff.trigger('match', app);
      } else {
        historysniff.trigger('nomatch', app);
      }

      if (apps.length > 0) {
        checkLastApp();
      }
    });
  }

  var Historysniff = function() {
    this.ms_measurement = 50;
    return this;
  };

  Historysniff.prototype.check = function(data) {
    apps = data;
    checkLastApp(this);
  };

  MicroEvent.mixin(Historysniff);
  exports.historysniff = new Historysniff();

})(window);
