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
