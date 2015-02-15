angular.module('player').directive('playerTrack', [
	  '$timeout'
	, 'trackFactory'
	, function ($timeout, trackFactory) {
		'use strict';

		return {
			  restrict: 'C'
			, require: '^player'

			, link: function (scope, $element, attributes, playerCtrl) {
				var 
					  audioPlayer = document.getElementById('player-audio')
					, range = $element[0].querySelector('[type=range]')
				;

				audioPlayer.oncanplaythrough = function () { 
					var
						  name = audioPlayer.src
						, length = audioPlayer.duration
						, position = audioPlayer.currentTime

						, track = trackFactory.create(name, length, position)
					;

					$timeout(function notifyAngularTrackInfoUpdated() {
						playerCtrl.updateTrack(track);
						range.max = track._length;

						scope.track = track;
					});
				};

				audioPlayer.ontimeupdate = function () {
					var  newPosition = audioPlayer.currentTime;	
					updatePosition(newPosition);
				};

				range.onchange = onRangePositionChange;
				range.oninput = onRangePositionChange;

				function onRangePositionChange() {
					var newPosition = range.value;
					audioPlayer.currentTime = newPosition;
					updatePosition(newPosition);
				}

				function updatePosition(newPosition) {
					var  
						  currentTrack = playerCtrl.getCurrentTrack()
						, scrolledBeforeBeginning = newPosition <= 0
						, scrolledToTheEnd = newPosition >= audioPlayer.duration
					;

					if (scrolledBeforeBeginning) {
						return;
					}

					if (scrolledToTheEnd) {
						newPosition = 0;
						playerCtrl.pause();
					}

					range.value = newPosition;
					$timeout(function notifyAngularUpdatePosition() {
						currentTrack.updatePosition(newPosition);
					});	
				}
			}
			, templateUrl: 'templates/player-track-tpl.html'
		};		
	}
]);

angular.module('player').factory('trackFactory', [
	function () {
		'use strict';

		function Track(name, length, position) {
			var track = this;

			track._name = name || '';
			track._length = length || 0.0;

			track._position = position || 0.0;
		}

		Track.prototype.updatePosition = function (position) {
			this._position = position;
		};

		var trackFactory = {};

		trackFactory.create = function (name, length, position) {
			var track = new Track(name, length, position);
			return track;
		};

		return trackFactory;
	}
]);

/* Вообще-то следовало бы брать автора и имя трека из метаданных композиции */
angular.module('player').filter('name', [
	function () {
		'use strict';

		return function (fullPath) {
			fullPath = fullPath || '';

			var 
				  pathParts = fullPath.split('/')
				, fileName = pathParts[pathParts.length - 1]
			;

			// Вообще-то следовало бы использовать ellipsis в CSS 
			if (fileName.length > 36) {
				fileName = fileName.substr(0, 35);
			}

			return fileName;
		};
	}
]);

angular.module('player').filter('timeMin', [
	  'addLeadingZeros'
	, function (addLeadingZeros) {
		'use strict';

		return function (sec) {
			sec = Number(sec) || 0.0;
			sec = Math.floor(sec);

			var
				  min = 0
				, order = 2
				, secondsInMinute = 60
			;

			if (sec > secondsInMinute) {
				min = Math.floor(sec / secondsInMinute);
				sec = sec % secondsInMinute;
			}

			return addLeadingZeros(min, order) + '.' + addLeadingZeros(sec, order);
		};
	}
]);

angular.module('player').filter('brackets', [
	function () {
		'use strict';

		return function (toWrap) {
			return '(' + toWrap + ')';	
		};
	}
]);

angular.module('player').constant('addLeadingZeros',
	function addLeadingZeros(value, numberOrder) {
		'use strict';

		var 
			  stringifiedValue = value.toString()
			,  orderLength = (numberOrder * 10).toString().length
			, valueLength = stringifiedValue.length
			, zerosCountToAdd = orderLength - valueLength
		;

		while (zerosCountToAdd > 0) {
			stringifiedValue = '0' + stringifiedValue;
			zerosCountToAdd -= 1;
		}

		return stringifiedValue;
	}
);