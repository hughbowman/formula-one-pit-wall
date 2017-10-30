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
