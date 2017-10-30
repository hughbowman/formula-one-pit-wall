/*
 *	page-dashboard.js
 */

hyperdrive.pageDashboard = (function () {
	'use strict';

	var html,
		raceMode,
		leaderboardMode,
		currentRaceIndex,
		currentModeRaces,
		currentModeRacesOrdered,
		currentModeLeaderboard,
		currentModeBestTime,
		currentRace,
		leaderboard;

	var loadPage = function () {
		raceMode = data.get('raceMode') || 'TT';
		leaderboardMode = data.get('leaderboardMode') || 'RACE';
		currentRaceIndex = data.get('currentRaceIndex') || 0;
		currentModeRaces = data.get('currentModeRaces') || null;
		currentModeRacesOrdered = data.get('currentModeRacesOrdered') || null;
		currentModeLeaderboard = data.get('currentModeLeaderboard') || null;
		currentModeBestTime = data.get('currentModeBestTime') || null;
		currentRace = data.get('currentRace') || null;
		leaderboard = data.get('leaderboard') || null;

		renderPage();
	};

	var renderPage = function () {
		html = $('#page-dashboard').render();
		$('#page-container').html(html);
	};

	var parseCSV = function (input) {
		console.log('pageDashboard.parseCSV');

		var $input = $(input);

		$input.parse({
			config: {
				complete: function (results, file) {
					if (results.errors.length > 0) {
						for (var i = 0; i < results.errors.length; i++) {
							console.error('CSV ERROR:', results.errors[i]);
						}
					} else {
						if ($input.hasClass('csv-races')) {
							hyperdrive.dataController.sortRaceData(results.data, file);
						}
						if ($input.hasClass('csv-race-graph')) {
							hyperdrive.dataController.sortRaceVelocity(results.data, file, $input.attr('id'));
						}
						if ($input.hasClass('csv-leaderboard')) {
							hyperdrive.dataController.sortLeaderboard(results.data, file);
						}
					}
				}
			},
			complete: function () {
				// console.log("All files done!");
			}
		});
	}

	var init = function () {
		console.log('dashboard.init');

		$(document).on('change', '.csv-file-input', function (e) {
			console.log('file changed');
			parseCSV(this);
		});
	};

	return {
		init: init,
		loadPage: loadPage
	};

}());
