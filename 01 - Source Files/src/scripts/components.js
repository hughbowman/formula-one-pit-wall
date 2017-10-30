/*
 *	-- Components --
 *	Scripts concatenated and placed before document closing </body>
 */

var hyperdrive = hyperdrive || {},
	data = $.localStorage;

// import('components/file-proto-fix.js');
// import('components/data-controller.js');
// import('components/site-header.js');
// import('pages/page-dashboard.js');
// import('pages/page-graph.js');
// import('pages/page-timing.js');
// import('pages/page-analysis.js');
// import('pages/page-social.js');
// import('components/router.js');

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
