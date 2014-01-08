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
$('#search_button').hammer().on('tap', function(e) {
	$('#main_container').css('transform-origin', '50% 0%');
	resultsPositionTop = -$('#list_and_map_view_outer_container').offset().top;

	// The animation is much more smooth when using "transform",
	// compared to modifying for example the "top"-property
	$('#main_container').css('transform', 'translateY(0px) scale(0.5)');

	setTimeout(function() {
		$('#main_container').css('transform', 'translateY('+ resultsPositionTop + 'px) scale(1)');
	}, 500);
});

$('button.back').hammer().on('tap', function(e) {
	$('#main_container').css('transform-origin', '50% 200%');
	$('#main_container').css('transform', 'translateY('+ resultsPositionTop + 'px) scale(.5)');
	setTimeout(function() {
		$('#main_container').css('transform', 'translateY(0px) scale(1)');
	}, 500);
});
