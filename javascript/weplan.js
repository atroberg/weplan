// Back history management
window.onpopstate = function(e) {
	if ( e.state == null ) return;
	onPopState(e.state.page);
};

function onPopState(page) {

	switch ( page ) {

		case 'Frontpage':
			$('#main_container').css('transform-origin', '50% 200%');
			$('#main_container').css('transform', 'translateY('+ resultsPositionTop + 'px) scale(.5)');
			setTimeout(function() {
				$('#main_container').css('transform', 'translateY(0px) scale(1)');
			}, 400);

			break;

		// Coming back from details view
		case 'Results':
			if ( $('#details').hasClass('active') ) {
				$('#details').removeClass('active');
			}

			else {
				$('#main_container').css('transform-origin', '50% 0%');
				resultsPositionTop = -$('#list_and_map_view_outer_container').offset().top;

				// The animation is much more smooth when using "transform",
				// compared to modifying for example the "top"-property
				$('#main_container').css('transform', 'translateY(0px) scale(.5)');

				setTimeout(function() {
					$('#main_container').css('transform', 'translateY('+ resultsPositionTop + 'px) scale(1)');
				}, 400);
			}

			break;

		case 'Details':
			$('#details').addClass('active');

			break;

	}

};

function addHistory(page) {
	window.history.pushState({page:page}, page);
}
addHistory("Frontpage");


// This is just for testing, to display more results in the list view
$('#search_results_list div.result').each(function() {
	var repeat = 2;
	var el = $(this);

	for ( var i = 0; i < repeat; i ++ ) {
		var clone = el.clone();
		clone.appendTo($('#search_results_list'));
	}
});

// Initialize the map
var map = L.map('map').setView([64.886265, 29.047852], 4);
L.tileLayer('http://mtile03.mqcdn.com/tiles/1.0.0/vy/map/{z}/{x}/{y}.png', {
	attribution: '',
	maxZoom: 18
}).addTo(map);

function windowScrollTop(position) {
	$('body').animate({
		'scrollTop': position
	});
}

// Switching between list and map view
$('#map_view_handle').hammer({
	'swipe_velocity': 0.1
}).on('swipeleft tap', function(e) {
	$('#list_and_map_view').css('transform', 'translateX(-50%)');
});
$('#list_view_handle').hammer({
	'swipe_velocity': 0.1
}).on('swiperight tap', function(e) {
	$('#list_and_map_view').css('transform', 'translateX(0px)');
});

// Search animation
var resultsPositionTop;
$('#search_button').hammer({
	// Prevent scrolling from being misinterpreted as tapping
	'tap_max_distance': 1
}).on('tap', function(e) {
	// Back history
	addHistory("Results");
	onPopState("Results");
});

$('button.back').hammer().on('tap', function(e) {
	window.history.back();
});

// Show details view when clicking result
$('.result').hammer().on('tap', function(e) {
	// Back history
	addHistory("Details");

	onPopState("Details");
});


// Tabs in details view

var currentActiveTab = 0;

// Cache some selectors
var detailsContainer = $('#details_container');
var tabMenu = $('#details ul.tabs');

tabMenu.find('li').hammer().on('tap', function() {
	showTab($(this).index());
});

function showTab(index) {

	// Check tab exists
	if ( index < 0 || index > detailsContainer.find('.tab').length - 1 ) {
		return;
	}

	currentActiveTab = index;

	tabMenu.find('.active').removeClass('active');
	tabMenu.find('li:eq(' + currentActiveTab + ')').addClass('active');

	var value = -(index * 25) + '%';
	detailsContainer.css('transform', 'translateX('+value+'%)');

	// Check if we need to initialize tab with some content
	
	var tab = detailsContainer.find('.tab:eq(' + currentActiveTab + ')');

	if ( tab.attr('data-initialized') != "true" ) {

		tab.attr('data-initialized', 'true');

		switch ( currentActiveTab ) {

			default:
				// By default we don't need to do anything
				break;

			// Photos
			case 1:
				// Fetch images from Google image search
				$.ajax({
					'url': 'https://ajax.googleapis.com/ajax/services/search/images?v=1.0',
					'type': 'GET',
					'data': {
						'q': 'Nice, France',
						'imgsz': 'medium|large',
						'rsz': 8 // results per page
					},
					'dataType': 'jsonp',
					'success': function(data) {
						// Remove loading msg
						tab.html('');

						for( var i = 0; i < data.responseData.results.length; i ++ ) {
							var result = data.responseData.results[i];
		
							var img = $('<div />').css('background-image', 'url("' + result.url + '")');
							tab.append(img);
						}
					}
				});
				break;
		}

	}
}

$('#details_container').hammer({
	'swipe_velocity': 0.1
}).on('swipeleft', function() {
	showTab(currentActiveTab + 1);
}).on('swiperight', function() {
	showTab(currentActiveTab - 1);
});
