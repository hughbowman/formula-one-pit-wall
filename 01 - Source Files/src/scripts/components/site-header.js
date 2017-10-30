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
