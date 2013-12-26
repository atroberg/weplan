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
var map = L.map('map').setView([64.886265, 29.047852], 2);
L.tileLayer('http://mtile03.mqcdn.com/tiles/1.0.0/vy/map/{z}/{x}/{y}.png', {
	attribution: '',
	maxZoom: 18
}).addTo(map);

function windowScrollTop(position) {
	$('body').animate({
		'scrollTop': position
	});
}

// Search animation
$('#search_button').hammer().on('tap', function(e) {
	windowScrollTop($('#list_and_map_view_outer_container').offset().top);
});

$('button.back').hammer().on('tap', function(e) {
	windowScrollTop(0);
});
