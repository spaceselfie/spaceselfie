var app = {};

(function () {
  'use strict';

  var calculateTop = function (degree) {
    if (degree < 0) {
      degree = 180 + 180 + degree;
    }
    return (degree - 150) * 8;
  };

  window.addEventListener('deviceorientation', function(event) {
    var degree = app.degree = event.beta;

    var $scope = $('#scope');
    $scope
      .css('top', calculateTop(degree))
      .show();
  }, false);

  var Satellite = app.Satellite = function () {
    this.$satellite = $('#satellite');
  };

  Satellite.prototype.start = function () {
    var $satellite = this.$satellite;

    var top = 0;
    var id = setInterval(function () {
      top -= 20;
      $satellite.css('top', top);

      if ($satellite.height() + top < 0) {
        clearInterval(id);
        $satellite.hide();
      }
    }, 100);
  };

  Satellite.prototype.flight = function () {
    var $satellite = this.$satellite;
    var degree = 130;
    var that = this;

    var id = setInterval(function () {
      that.degree = degree;
      that.offset = degree - app.degree;

      if (that.isChance()) {
        $('#take').addClass('btn-primary');
      } else {
        $('#take').removeClass('btn-primary');
      }

      var top = 700 - (degree - app.degree) * 12;
      that.top = top;
//      console.log('chance: ' + that.isChance() + ', offset: ' + that.offset + ', degree: ' + degree + ', top: ' + top);
      $satellite
        .css('top', top)
        .show();

      degree++;

      if (degree < 60 || degree > 300) {
        clearInterval(id);
        $satellite.hide();
      }
    }, 100);
  };

  Satellite.prototype.isChance = function () {
    var getPositon = function ($el) {
      var offset = $el.offset();
      return {
        top: offset.top,
        bottom: offset.top + $el.height()
      };
    };

    var satellite = getPositon(this.$satellite);
    var scope = getPositon($('#scope'));

    console.log('satellite: ' + satellite);
    console.log('scope: ' + scope);
    return satellite.top <= scope.bottom && satellite.bottom >= scope.top;
  };

  var Map = app.Map = function () {
    this.$map = $('#map');

    var mapOptions = {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 16,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var that = this;
    navigator.geolocation.watchPosition(function (data) {
      console.log(data.coords.latitude);
      console.log(data.coords.longitude);
      that.setCenter(data.coords);
    });
  };

  Map.prototype.setCenter = function (coords) {
    this.map.setCenter(new google.maps.LatLng(coords.latitude, coords.longitude));
  };

  Map.prototype.setSize = function (width, height) {
    this.$map.width(width);
    this.$map.height(height);
  };

  Map.prototype.show = function () {
    this.$map.css('zIndex', 7);
  };

  Map.prototype.hide = function () {
    this.$map.css('zIndex', 0);
  };

  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetuserMedia;

  var Camera = app.Camera = function () {
    this.$finder = $('#finder');
  };

  Camera.prototype.initialize = function () {
    var $finder = this.$finder;

    navigator.getUserMedia({video: true}, function (stream) {
      console.log('VIDEO');
      $finder.attr('src', window.URL.createObjectURL(stream));

      setTimeout(function () {
        $finder[0].play();
      });
    }, function () {});

    this.map = new Map();
  };

  Camera.prototype.show = function () {
    this.$finder.show();
  };

  Camera.prototype.hide = function () {
    this.$finder.hide();
  };

  Camera.prototype.takePicture = function () {
    var $picture = $('#picture');
    var context = $picture[0].getContext('2d');
    context.drawImage(this.$finder[0], 0, 0);
  };

  Camera.prototype.takeMap = function () {
    this.map.show();
  };
})();

$(document).ready(function () {
  'use strict';

  var camera = new app.Camera();
  camera.initialize();

  var satellite = new app.Satellite();

  $('#start').on('click', function () {
    camera.show();
  });

  $('#take').on('click', function () {
    camera.takeMap();
  });

  $('#map-show').on('click', function () {
    camera.map.show();
  });

  $('#map-hide').on('click', function () {
    camera.map.hide();
  });

  $('#satellite-start').on('click', function () {
    satellite.start();
  });

  $('#satellite-flight').on('click', function () {
    satellite.flight();
  });
});
