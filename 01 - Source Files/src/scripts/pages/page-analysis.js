/*
 *	page-analysis.js
 */

hyperdrive.pageAnalysis = (function () {
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
		html = $('#page-analysis').render({
			'raceMode': raceMode,
			'currentRaceIndex': currentRaceIndex,
			'currentModeBestTime': currentModeBestTime,
			'currentRace': currentRace
		});
		$('#page-container').html(html);
	};

	var init = function () {
		console.log('analysis.init');
	};

	return {
		init: init,
		loadPage: loadPage
	};

}());
