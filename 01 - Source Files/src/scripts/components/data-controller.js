/*
 *	data-controller.js
 */

hyperdrive.dataController = (function () {
	'use strict';

	var raceMode = data.get('raceMode') || null,
		leaderboardMode = data.get('leaderboardMode') || null,
		currentModeRaces = data.get('currentModeRaces') || null,
		currentModeRacesOrdered = data.get('currentModeRacesOrdered') || null,
		currentModeLeaderboard = data.get('currentModeLeaderboard') || null,
		currentModeBestTime = data.get('currentModeBestTime') || null,
		currentRaceIndex = data.get('currentRaceIndex') || null,
		currentRace = data.get('currentRace') || null,
		leaderboard = data.get('leaderboard') || null;


	var sortRaceData = function (raceData, metaData) {
		// console.log('dataController.sortRaceData');
		// console.log(raceData, metaData);

		var races = {
				'TT': {
					'RACES': [],
					'BEST_RUN': {
						'TIME': 0
					}
				},
				'RR': {
					'RACES': [],
					'BEST_RUN': {
						'TIME': 0
					}
				}
			},
			race = {},
			d;

		function getLapDiagramPercent (value) {
			// console.log('\ngetLapDiagramPercent');
			// console.log('value', value);

			var scaleOuter = 188,
				scaleInner = 130,
				totalP = 50 * value,
				p = {
					OUTER: 0,
					INNER: 0
				};

			if (totalP > 50) {
				p.OUTER = 100;
				p.INNER = (totalP - 50) * 2;
			} else {
				p.OUTER = totalP * 2;
				p.INNER = 0;
			}

			p.OUTER = (scaleOuter * -1) + (scaleOuter * (p.OUTER / 100));
			p.INNER = (scaleInner * -1) + (scaleInner * (p.INNER / 100));

			return p;
		}

		function cleanFloat (value, decimalPlaces) {
			var returnVal = parseFloat(value);
			if (typeof returnVal !== 'number') {
				returnVal = 0;
			}
			return returnVal;
		}

		var raceCount = raceData.length < 10 ? races.length : 9;
		for (var i = 1; i < raceCount; i++) {
			d = raceData[i];

			race = {
				'RACE_MODE': d[0],
				'MODE_PLACE': {
					'POSITION': 0,
					'LABEL': ''
				},
				'TARGET_TIME': d[1],
				'RECORD_TIME': {
					'VALUE': d[2],
					'CHANGE': '',
					'CHANGE_VALUE': 0
				},
				'DRAG_COEFFICIENT': d[3],
				'PEAK_WHEELSPEED': d[4],
				'LAST_RACE_TIME': {
					'VALUE': 0,
					'CHANGE': '',
					'CHANGE_VALUE': 0
				},
				'RACENO': d[5],
				'LANE': d[6],
				'REACTIONTIME': {
					'TIME': cleanFloat(d[7].split('|')[0], 3),
					'TIME_PERCENT': 50 * d[7].split('|')[0] || 0,
					'VALUE': cleanFloat(d[7].split('|')[1], 3)
					// 'PLACE': {
					// 	'TIME': '+0.005s',
					// 	'LABEL': '1st'
					// }
				},
				'ACCELERATION': {
					'TIME': cleanFloat(d[8].split('|')[0], 3),
					'TIME_PERCENT': 50 * d[8].split('|')[0],
					'VALUE': cleanFloat(d[8].split('|')[1], 3)
				},
				'RUNOUT': {
					'TIME': cleanFloat(d[9].split('|')[0], 3),
					'TIME_PERCENT': 50 * d[9].split('|')[0],
					'VALUE': cleanFloat(d[9].split('|')[1], 3)
				},
				'GROSSLAP': {
					'TIME': cleanFloat(d[10].split('|')[0], 3),
					'TIME_PERCENT': 50 * d[10].split('|')[0],
					'VALUE': cleanFloat(d[10].split('|')[1], 3)
				},
				'STOPTIME': {
					'TIME': cleanFloat(d[11].split('|')[0], 3),
					'TIME_PERCENT': 50 * d[11].split('|')[0],
					'VALUE': cleanFloat(d[11].split('|')[1], 3)
				},
				'NETLAP': {
					'VALUE': cleanFloat(d[12], 3),
					'DIAGRAM': getLapDiagramPercent(d[12])
				},
				'PENALTIES': {
					'VALUE': d[13].split('|')[0] || 0,
					'LABEL': d[13].split('|')[1]
				},
				'LERS_ADVANTAGE': d[14],
				'THRUSTFORCE': {
					'VALUE': d[15],
					'DIFF': 'UP',
					'CHANGE': ''
				},
				'LIFTFORCE': {
					'VALUE': d[16],
					'DIFF': 'DOWN',
					'CHANGE': ''
				},
				'DOWNFORCE': {
					'VALUE': d[17],
					'DIFF': 'DOWN',
					'CHANGE': ''
				},
				'TETHERLINE_FORCE': {
					'VALUE': d[18],
					'DIFF': 'DOWN',
					'CHANGE': ''
				},
				'BEARINGWEAR': {
					'PEAK': d[19],
					'LAPS': 0
				},
				'VELOCITY': null
			};

			races[race.RACE_MODE].RACES[race.RACENO - 1] = race;
		}

		function compareNetLap(a, b) {
			return a.NETLAP.VALUE - b.NETLAP.VALUE;
		}
		function compareRaceNo(a, b) {
			return a.RACENO - b.RACENO;
		}

		$.each(races, function (key, modeRaces) {
			races[key].RACES.sort(compareNetLap);

			for (var i = 0; i < modeRaces.RACES.length; i++) {

				races[key].RACES[i].MODE_PLACE.POSITION = i + 1;

				if (i === 0) {
					races[key].RACES[i].MODE_PLACE.LABEL = 'best';
					races[key].BEST_RUN.TIME = races[key].RACES[i].NETLAP.VALUE;
				}
				else if (i === modeRaces.length - 1) {
					races[key].RACES[i].MODE_PLACE.LABEL = 'worst';
				}
			}

			races[key].RACES.sort(compareRaceNo);
		});

		console.log(races);

		data.set('races', races);
		setCurrentRace('TT', 0);
	};

	var sortRaceVelocity = function (velocityData, metaData, raceID) {
		// console.log('dataController.sortRaceVelocity');
		// console.log(velocityData, metaData, raceID);

		var mode = raceID.split('-')[0],
			raceNumber = raceID.split('-')[1];

		if (data.isSet('races.' + mode)) {
			var raceIndex = data.get('races.' + mode + '.RACES').findIndex(function (r) {
				return r.RACENO === raceNumber;
			});

			if (raceIndex > -1) {
				velocityData.splice(0, 1);

				var races = data.get('races');
				races[mode].RACES[raceIndex].VELOCITY = velocityData;
				data.set('races', races);

				if (data.isSet('raceMode') && data.isSet('currentRaceIndex')) {
						setCurrentRace(data.get('raceMode'), data.get('currentRaceIndex'));
				}

			} else {
				console.error('No race found for ' + raceID);
			}

		} else {
			console.error('No races found for ' + mode);
		}
	};

	var sortLeaderboard = function (leaderboardData, metaData) {
		// console.log('dataController.sortLeaderboard');
		// console.log(leaderboardData, metaData);

		var leaderboard = {
			'RACE': [],
			'GP': []
		},
			race = {},
			gp = {},
			times = {
				RACE: {
					best: parseFloat(leaderboardData[1][1]),
					diff: 0
				},
				GP: {
					best: parseFloat(leaderboardData[1][2]),
					diff: 0
				}
			},
			t;

		for (var i = 1; i < leaderboardData.length; i++) {
			t = leaderboardData[i];

			if (t[0] === '' || t[0] === ' ') {
				continue;
			}

			times.RACE.diff = parseFloat(t[1]) - times.RACE.best;
			times.GP.diff = parseFloat(t[2]) - times.GP.best;

			race = {
				'NAME': t[0],
				'TIME': parseFloat(t[1]),
				'DIFF': times.RACE.diff.toFixed(4)
			};

			gp = {
				'NAME': t[0],
				'TIME': parseFloat(t[2]),
				'DIFF': times.GP.diff.toFixed(4)
			};

			leaderboard.RACE.push(race);
			leaderboard.GP.push(gp);
		}

		data.set('leaderboard', leaderboard);
		setLeaderboardMode('RACE', 0);
	};

	var setLeaderboardMode = function (mode, reload) {
		// console.log('dataController.setLeaderboardMode', mode);

		data.set('leaderboardMode', mode);
		data.set('currentModeLeaderboard', data.get('leaderboard')[mode]);

		if (!!reload) {
			hyperdrive.router.reloadPage();
		}
	};

	var setRaceMode = function (mode, reload) {
		// console.log('dataController.setRaceMode', mode);

		data.set('raceMode', mode);
		data.set('currentModeRaces', data.get('races')[mode].RACES);
		data.set('currentModeRacesOrdered', data.get('races')[mode].RACES);
		data.set('currentModeBestTime', data.get('races')[mode].BEST_RUN.TIME);

		if (!!reload) {
			hyperdrive.router.reloadPage();
		}
	};

	var sortCurrentRaces = function (sortBy, subSortBy, reload) {
		// console.log('dataController.sortCurrentRaces', mode);

		var mode = data.get('raceMode');
		if (mode === null) {
			return;
		}

		data.set('currentModeRaces', data.get('races')[mode].RACES);
		var raceData = data.get('currentModeRaces');

		if (raceData === null) {
		 	return;
		}

		raceData = raceData.slice(0);

		raceData.sort(function (a, b) {
			if (typeof subSortBy !== 'undefined') {
				return parseFloat(a[sortBy][subSortBy]) - parseFloat(b[sortBy][subSortBy]);
			} else {
				return parseFloat(a[sortBy]) - parseFloat(b[sortBy]);
			}
		});

		data.set('currentModeRaces', raceData);

		if (!!reload) {
			hyperdrive.router.reloadPage();
		}
	};

	var setCurrentRace = function (mode, index, reload) {
		// console.log('dataController.setCurrentRace', mode, index);

		data.set('currentRaceIndex', index);
		data.set('currentRace', data.get('races')[mode].RACES[parseInt(index, 0)]);

		setRaceMode(mode);

		// console.log(data.get('currentRace'));

		if (!!reload) {
			hyperdrive.router.reloadPage();
		}
	};

	var clearAllData = function () {
		// console.log('dataController.clearAllData');

		data.removeAll();
		$('.form-upload-csv-files')[0].reset();
	};

	var init = function () {
		console.log('dataController.init');

		if (data.isSet('races')) {
			setCurrentRace('TT', 0);

			console.log('Races');
			console.log(data.get('races'));

		} else {
			page.redirect('/');
		}

		$(document).on('click', '.js-page-links a', function (e) {
			e.preventDefault();
			page($(this).attr('href') || $(this).attr('xlink:href'));
		});

		$(document).on('click', '.js-set-current-race', function (e) {
			e.preventDefault();
			var $li = $(this).closest('li');
			if ($li.hasClass('active') === false && $li.hasClass('disabled') === false) {
				var params = $(this).attr('href').split('-');
				hyperdrive.dataController.setCurrentRace(params[0].replace('#', ''), params[1], true);
			}
		});

		$(document).on('click', '.js-set-leaderboard-mode', function (e) {
			e.preventDefault();
			var $li = $(this).closest('li');
			if ($li.hasClass('active') === false) {
				hyperdrive.dataController.setLeaderboardMode($(this).attr('href').replace('#', ''), true);
			}
		});

		$(document).on('click', '.js-set-race-mode', function (e) {
			e.preventDefault();
			var $li = $(this).closest('li');
			if ($li.hasClass('active') === false) {
				hyperdrive.dataController.setCurrentRace($(this).attr('href').replace('#', ''), 0, true);
			}
		});

		$(document).on('click', '.js-sort-current-races', function (e) {
			e.preventDefault();
			var params = $(this).attr('href').split('-');
			hyperdrive.dataController.sortCurrentRaces(params[0].replace('#', ''), params[1], true);
		});

		$(document).on('click', '.js-clear-all-data', function (e) {
			e.preventDefault();
			if (window.confirm('Clear all app data?')) {
				clearAllData();
			}
		});
	};

	return {
		init: init,
		setLeaderboardMode: setLeaderboardMode,
		setRaceMode: setRaceMode,
		setCurrentRace: setCurrentRace,
		sortCurrentRaces: sortCurrentRaces,
		sortRaceData: sortRaceData,
		sortRaceVelocity: sortRaceVelocity,
		sortLeaderboard: sortLeaderboard
	};

}());
