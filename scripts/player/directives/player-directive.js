angular.module('player').directive('player', [
	  '$timeout'
	, 'playerFactory'
	, function ($timeout, playerFactory) {
		'use strict';

		var nop = angular.noop;

		return {
			  restrict: 'C'

			, transclude: true
			, replace: true

			, require: 'player'

			,  controller: [
				  '$scope'
				, '$q'
				, '$window'
				, function ($scope, $q, $window) {
					var 
						  player = playerFactory.create()
						, playerCtrl = this

						, playPauseDefer = $q.defer()
						, muteUnmuteDefer = $q.defer()

						// достаточно для данного таска
						, ie = /Trident/.test($window.navigator.userAgent)
					;

					playerCtrl.getTrackPath = function () {
						switch(ie) {
							case true:
								return './audio/test.mp3';
							default:
								return './audio/test.ogg';
						}
					};

					playerCtrl.getTrackType = function () {
						switch(ie) {
							case true:
								return 'audio/mp3';
							default:
								return 'audio/ogg';
						}
					};

					playerCtrl.playPauseToggle = function () {
						var isPlaying = player.isPlaying();

						isPlaying ?
							player.pause()
							:
							player.play(); 

						playPauseDefer.notify(!isPlaying);
					};

					playerCtrl.whenPlayPauseToggled = function () {
						return playPauseDefer.promise;
					};

					playerCtrl.muteUnmuteToggle = function () {
						var isMuted = player.isMuted();

						isMuted ?
							player.unmute()
							:
							player.mute();

						muteUnmuteDefer.notify(!isMuted);
					};

					playerCtrl.whenMuteUnmuteToggled = function () {
						return muteUnmuteDefer.promise;
					};

					playerCtrl.updateTrack = function (track) {
						player.updateTrack(track);
					};

					playerCtrl.getCurrentTrack = function () {
						return player.track;
					};

					playerCtrl.isPlaying = player.isPlaying.bind(player);
					playerCtrl.isMuted = player.isMuted.bind(player);
					playerCtrl.hasTrack = player.hasTrack.bind(player);

					$scope.playerCtrl = playerCtrl;
				}
			]

			,  link: function (scope, $element, attributes, playerCtrl) {
				var audioPlayer = document.getElementById('player-audio');

				audioPlayer.loop = false;

				playerCtrl.whenPlayPauseToggled().then(nop, nop, function (play) {
					play = play || false;

					switch(play) {
						case true:
							audioPlayer.play();
							break;

						case false:
							/* falls through */
						default:
							audioPlayer.pause();
					}
				});

				playerCtrl.whenMuteUnmuteToggled().then(nop, nop, function (mute) {
					audioPlayer.muted = mute || false;	
				});
			}

			, templateUrl: 'templates/player-tpl.html'
		};
	}
]);

angular.module('player').factory('playerFactory', [
	function () {
		'use strict';

		function Player() {
			var player = this;

			player._isMuted = false;
			player._isPlaying = false;
			player.track = null;
		}

		// Play/Pause
		Player.prototype.play = function () {
			this._isPlaying = true;
		};

		Player.prototype.pause = function () {
			this._isPlaying = false;
		};

		Player.prototype.isPlaying = function () {
			return this._isPlaying;
		};

		// Mute/Unmute
		Player.prototype.mute = function () {
			this._isMuted = true;
		};

		Player.prototype.unmute = function () {
			this._isMuted = false;
		};

		Player.prototype.isMuted = function () {
			return this._isMuted;			
		};

		Player.prototype.hasTrack = function () {
			return this.track !== null;
		};

		Player.prototype.updateTrack = function (track) {
			this.track = track;
		};

		var playerFactory = {};

		playerFactory.create = function () {
			var player = new Player();
			return player;
		};

		return playerFactory;
	}
]);