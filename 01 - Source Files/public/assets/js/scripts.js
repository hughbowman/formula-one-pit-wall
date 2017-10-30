/*
 *	-- Components --
 *	Scripts concatenated and placed before document closing </body>
 */

var hyperdrive = hyperdrive || {},
	data = $.localStorage;


// Various fixes to allow index.html to be run from a local filesystem
$(function() {
  if (window.location.protocol === 'file:') {
    var doNothing = function() { return; };

    window.history.back = doNothing;
    window.history.pushState = doNothing;
    window.history.replaceState = doNothing;
  }
});

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

/*
 *	site-header.js
 */

hyperdrive.siteHeader = (function () {
	'use strict';

	var $siteHeader = $('.site-header'),
		$pageLinks = $siteHeader.find('.js-page-links'),
		$pageName = $siteHeader.find('.js-page-name'),
		$pageNumber = $siteHeader.find('.js-page-number'),
		$headerDate = $siteHeader.find('.event-details .date'),
		dateInterval = null,
		pageNumber = '';

	var setHeaderTime = function() {
		$headerDate.text(moment().format('D MMMM YYYY h:mma'));
	};

	var startClock = function () {
		if (dateInterval !== null) {
			clearInterval(dateInterval);
		}

		// Avoid the initial delay caused by waiting for the interval to fire
		setHeaderTime();

		// Every second should be fine
		// The shortest timeframe we're displaying is minutes
		dateInterval = setInterval(setHeaderTime, 1000);
	};

	var toggleNavBarNumber = function (num) {
		$pageLinks.find('a.active').removeClass('active');
		$pageLinks.find('a[data-page-number="' + num + '"]').addClass('active');
	};

	var updateSiteHeader = function (pageName) {

		switch (pageName) {
			case 'dashboard':
				pageNumber = '';
				break;
			case 'graph':
				pageNumber = '01';
				break;

			case 'timing':
				pageNumber = '02';
				break;

			case 'analysis':
				pageNumber = '03';
				break;

			case 'social':
				pageNumber = '04';
				break;

			default:
				pageNumber = '';
				break;
		}

		toggleNavBarNumber(pageNumber);
		$pageName.text(pageName);
		$pageNumber.text(pageNumber);
	};

	var init = function () {
		console.log('siteHeader.init');
		startClock();
	};

	return {
		init: init,
		updateSiteHeader: updateSiteHeader
	};

}());

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

/*
 *	page-graph.js
 */

hyperdrive.pageGraph = (function () {
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
		html = $('#page-graph').render({
			'raceMode': raceMode,
			'currentRaceIndex': currentRaceIndex,
			'currentRace': currentRace
		});
		$('#page-container').html(html);

		if (currentRace) {
			renderVelocityGraph();
		}
	};

	var renderVelocityGraph = function () {
		var graphData = currentRace.VELOCITY;

		var margin = {
				top: 20,
				right: 20,
				bottom: 42,
				left: 85
			},
			width = 980 - margin.left - margin.right,
			height = 315 - margin.top - margin.bottom;


		function createGridLinesY() {
			return d3.axisLeft(yScale).ticks(35)
		}

		function createAxisLeft() {
			return d3.axisLeft(yScale).ticks(6)
		}

		function createAxisBottom() {
			return d3.axisBottom(xScale).ticks(12).tickSize(10).tickPadding(5);
		}

		function createAxisBottomSmall() {
			return d3.axisBottom(xScale).ticks(12 * 10).tickSize(4).tickPadding(5).tickFormat('');
		}

		// d3.scaleLinear().domain(d3.extent(graphData.map(function (d) { return d[0] }))).range([0, width]),

		var xScale = d3.scaleLinear().domain([0, 2]).range([0, width]),
			yScale = d3.scaleLinear().domain([0, 30]).range([height, 0]),
			valueLine = d3.line()
				.x(function (d) { return x(d) })
				.y(function (d) { return y(d) });

		var svgGraph = d3.select('#velocity-graph')
			.append('svg')
				.attrs({
					width: width + margin.left + margin.right,
					height: height + margin.top + margin.bottom
				})
			.append('g')
				.attrs({
					transform: 'translate(' + margin.left + ',' + margin.top + ')'
				});

		svgGraph.append('rect')
			.attrs({
				class: 'graph-bg',
				width: width,
				height: height
			});

		svgGraph.append('g')
			.attrs({
				class: 'grid-lines'
			})
			.call(
				createGridLinesY()
					.tickSize(-width)
					.tickFormat('')
			);

		svgGraph.append('g')
			.attrs({
				class: 'axis axis-left'
			})
			.call(
				createAxisLeft()
			);

		svgGraph.append('g')
			.attrs({
				class: 'axis axis-bottom',
				transform: 'translate(0, ' + (height + 10) + ')'
			})
			.call(
				createAxisBottom()
			);

		svgGraph.append('g')
			.attrs({
				class: 'axis axis-bottom-small',
				transform: 'translate(0, ' + (height + 10) + ')'
			})
			.call(
				createAxisBottomSmall()
			);


		var line = d3.line()
			.x(function (d) { return xScale(d[0]) })
			.y(function (d) { return yScale(d[1]) });

		var area = d3.area()
			.x(function (d) { return xScale(d[0]) })
			.y1(function (d) { return yScale(d[1]) })
			.y0(yScale(0));

		var circleR = 7;


		// AREAS
		if (currentRace.VELOCITY) {
			if (currentRace.REACTIONTIME) {
				svgGraph.append('path')
					.datum(graphData.filter(function (d) {
						return d[0] < currentRace.REACTIONTIME.TIME;
					}))
					.attr('class', 'graph-area area-reaction')
					.attr('d', area);
			}

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					if (currentRace.REACTIONTIME) {
						return d[0] >= currentRace.REACTIONTIME.TIME && d[0] <= currentRace.ACCELERATION.TIME;
					} else {
						return d[0] < currentRace.ACCELERATION.TIME;
					}
				}))
				.attr('class', 'graph-area area-acceleration')
				.attr('d', area);

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					return d[0] >= currentRace.ACCELERATION.TIME && d[0] <= currentRace.RUNOUT.TIME;
				}))
				.attr('class', 'graph-area area-runout')
				.attr('d', area);

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					return d[0] >= currentRace.RUNOUT.TIME && d[0] <= currentRace.GROSSLAP.TIME;
				}))
				.attr('class', 'graph-area area-coasting')
				.attr('d', area);

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					return d[0] >= currentRace.GROSSLAP.TIME;
				}))
				.attr('class', 'graph-area area-deceleration')
				.attr('d', area);

			// LINES
			if (currentRace.REACTIONTIME) {
				svgGraph.append('path')
					.datum(graphData.filter(function (d) {
						return d[0] < currentRace.REACTIONTIME.TIME;
					}))
					.attr('class', 'graph-line line-reaction')
					.attr('d', line);
			}

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					if (currentRace.REACTIONTIME) {
						return d[0] >= currentRace.REACTIONTIME.TIME && d[0] <= currentRace.ACCELERATION.TIME;
					} else {
						return d[0] < currentRace.ACCELERATION.TIME;
					}
				}))
				.attr('class', 'graph-line line-acceleration')
				.attr('d', line);

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					return d[0] >= currentRace.ACCELERATION.TIME && d[0] <= currentRace.RUNOUT.TIME;
				}))
				.attr('class', 'graph-line line-runout')
				.attr('d', line);

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					return d[0] >= currentRace.RUNOUT.TIME && d[0] <= currentRace.GROSSLAP.TIME;
				}))
				.attr('class', 'graph-line line-coasting')
				.attr('d', line);

			svgGraph.append('path')
				.datum(graphData.filter(function (d) {
					return d[0] >= currentRace.GROSSLAP.TIME;
				}))
				.attr('class', 'graph-line line-deceleration')
				.attr('d', line);
		}
		// CIRCLES
		if (currentRace.REACTIONTIME) {
			svgGraph.append('circle')
				.attrs({
					class: 'graph-circle circle-reaction',
					cx: xScale(currentRace.REACTIONTIME.TIME),
					cy: yScale(currentRace.REACTIONTIME.VALUE),
					r: circleR,
					'data-hover-info': 'Reaction Time|' + currentRace.REACTIONTIME.TIME + '|' + currentRace.REACTIONTIME.VALUE
				});
		}

		svgGraph.append('circle')
			.attrs({
				class: 'graph-circle circle-acceleration',
				cx: xScale(currentRace.ACCELERATION.TIME),
				cy: yScale(currentRace.ACCELERATION.VALUE),
				r: circleR,
				'data-hover-info': 'Accelleration|' + currentRace.ACCELERATION.TIME + '|' + currentRace.ACCELERATION.VALUE
			});

		svgGraph.append('circle')
			.attrs({
				class: 'graph-circle circle-runout',
				cx: xScale(currentRace.RUNOUT.TIME),
				cy: yScale(currentRace.RUNOUT.VALUE),
				r: circleR,
				'data-hover-info': 'Run Out|' + currentRace.RUNOUT.TIME + '|' + currentRace.RUNOUT.VALUE
			});

		svgGraph.append('circle')
			.attrs({
				class: 'graph-circle circle-deceleration',
				cx: xScale(currentRace.GROSSLAP.TIME),
				cy: yScale(currentRace.GROSSLAP.VALUE),
				r: circleR,
				'data-hover-info': 'Gross Lap|' + currentRace.GROSSLAP.TIME + '|' + currentRace.GROSSLAP.VALUE
			});

		// BAR GRAPH
		var $stage = $('.stage-container');

		if (currentRace.REACTIONTIME) {
			$stage.find('.bar-reaction').css({
				'width': xScale(currentRace.REACTIONTIME.TIME) + 'px'
			});
			$stage.find('.bar-acceleration').css({
				'width': xScale(currentRace.ACCELERATION.TIME) - xScale(currentRace.REACTIONTIME.TIME) + 'px'
			});
		} else {
			$stage.find('.bar-reaction').css({
				'width': '0px'
			});
			$stage.find('.bar-acceleration').css({
				'width': xScale(currentRace.ACCELERATION.TIME) + 'px'
			});
		}

		$stage.find('.bar-runout').css({
			'width': xScale(currentRace.RUNOUT.TIME) - xScale(currentRace.ACCELERATION.TIME) + 'px'
		});
		$stage.find('.bar-coasting').css({
			'width': xScale(currentRace.GROSSLAP.TIME) - xScale(currentRace.RUNOUT.TIME)+ 'px'
		});

		$stage.find('.bar-deceleration').css({
			'width': $stage.width() - xScale(currentRace.GROSSLAP.TIME) + 'px'
		});

	};

	var showGraphTooltip = function (target, state) {
		var show = (typeof state !== 'undefined') ?  state : 1;

		var $tooltip = $('#graph-tooltip'),
			offset = target.getBoundingClientRect(),
			tooltipData = $(target).attr('data-hover-info').split('|');

		$tooltip.hide();

		if (show) {
			var name = tooltipData[0],
				time = tooltipData[1],
				value = tooltipData[2];

			if (name !== 'null' && time !== 'null' && value !== 'null') {
				$tooltip.find('.js-tooltip-name').text(name);
				$tooltip.find('.js-tooltip-time').text(time);
				$tooltip.find('.js-tooltip-value').text(value);
				$tooltip.css({
					left: offset.left + 6,
					top: offset.top - 32
				}).show();
			}
		}
	};

	var init = function () {
		console.log('graph.init');

		$(document).on('mouseenter', '#velocity-graph .graph-circle', function (e) {
			showGraphTooltip(this);
		});

		$(document).on('mouseleave', '#velocity-graph .graph-circle', function (e) {
			showGraphTooltip(this, false);
		});
	};

	return {
		init: init,
		loadPage: loadPage
	};

}());

/*
 *	page-timing.js
 */

hyperdrive.pageTiming = (function () {
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
		html = $('#page-timing').render({
			'raceMode': raceMode,
			'leaderboardMode': leaderboardMode,
			'currentModeRaces': currentModeRaces,
			'currentModeRacesOrdered': currentModeRacesOrdered,
			'currentModeLeaderboard': currentModeLeaderboard,
			'currentModeBestTime': currentModeBestTime,
			'leaderboard': leaderboard
		});
		$('#page-container').html(html);

		console.log('currentModeBestTime', currentModeBestTime);
	};

	var init = function () {
		console.log('timing.init');
	};

	return {
		init: init,
		loadPage: loadPage
	};

}());

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

/*
 *	page-social.js
 */

hyperdrive.pageSocial = (function () {
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
		html = $('#page-social').render();
		$('#page-container').html(html);
	};

	var init = function () {
		console.log('social.init');
	};

	return {
		init: init,
		loadPage: loadPage
	};

}());

/*
 *	router.js
 */

hyperdrive.router = (function () {
	'use strict';

	var pageCtx = null,
		prevPage = '/';

	var saveCtx = function (ctx) {
		pageCtx = ctx;
		prevPage = ctx.path;

		console.log(ctx);
	};

	var reloadPage = function () {
		console.log('reloadPage', prevPage);
		page(prevPage);
	};

	var init = function () {
		console.log('router.init');

		page('/', function (ctx) {
			hyperdrive.siteHeader.updateSiteHeader('dashboard');
			hyperdrive.pageDashboard.loadPage();

			// page.redirect('/graph');

			saveCtx(ctx);
		});

		page('/graph', function (ctx) {
			hyperdrive.siteHeader.updateSiteHeader('graph');
			hyperdrive.pageGraph.loadPage();

			saveCtx(ctx);
		});

		page('/timing', function (ctx) {
			hyperdrive.siteHeader.updateSiteHeader('timing');
			hyperdrive.pageTiming.loadPage();

			saveCtx(ctx);
		});

		page('/analysis', function (ctx) {
			hyperdrive.siteHeader.updateSiteHeader('analysis');
			hyperdrive.pageAnalysis.loadPage();

			saveCtx(ctx);
		});

		page('/social', function (ctx) {
			hyperdrive.siteHeader.updateSiteHeader('social');
			hyperdrive.pageSocial.loadPage();

			saveCtx(ctx);
		});

		page('*', function(){
			page.redirect('/');
		});

		page();
	};

	return {
		init: init,
		reloadPage: reloadPage
	};

}());


$(document).ready(function () {

	hyperdrive.dataController.init();
	hyperdrive.siteHeader.init();
	hyperdrive.pageDashboard.init();
	hyperdrive.pageGraph.init();
	hyperdrive.pageTiming.init();
	hyperdrive.pageAnalysis.init();
	hyperdrive.pageSocial.init();

	hyperdrive.router.init();

});
