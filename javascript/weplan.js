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

			else if ( $('#filter').hasClass('active') ) {
				$('#filter').removeClass('active');
			}

			else if ( $('#sort').hasClass('active') ) {
				$('#sort').removeClass('active');
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

		case 'Filter':
			$('#filter').addClass('active');	
			initializeFilterSliders();
			break;

		case 'Sort':
			$('#sort').addClass('active');	
			break;

	}

};

function addHistory(page) {
	window.history.pushState({page:page}, page);
}
addHistory("Frontpage");


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


// A global variable for holding the currently active
// destination in the details view
var destinationInDetailsView;

// Add destination to search results
function showDestination(destination, listIndex) {
	var result = $('#list_template').clone().removeAttr('id').attr('data-list-index', listIndex);

	// Show details view when clicking result
	result.hammer().on('tap', function(e) {
		// Update details view with the right contents
		destinationInDetailsView = destinations[listIndex];
		
		// Back history
		addHistory("Details");
		onPopState("Details");
	});

	result.find('h2 span').html(destination.city + ', ' + destination.country);
	result.find('h2 img').attr('src', 'images/flags/' + destination.country + '.png');

	if ( destination.photos && destination.photos.length > 0 ) {
		// TODO
		//result.find('.left img').attr('src', destination.photos[0]);
	}

	// Randomize weather icon
	var icons = ['fa-sun-o', 'fa-cloud'];
	var temperature = Math.round(destination.temperature);
	result.attr('data-temperature', temperature);
	destination.calculatedTemperature = temperature;
	if ( temperature > 0 ) temperature = '+' + temperature;
	result.find('.temperature').html('<i class="fa ' + icons[Math.floor(Math.random()*icons.length)] + '"></i> ' + temperature + '°C');

	// Show random rating (0.5 - 3)
	var rating = (0.0 + (1 + Math.floor(Math.random() * 5 + 1))) / 2.0;
	var ratingEl = result.find('.rating').html('');
	result.attr('data-rating', rating);
	for ( var i = 0; i < rating; i ++ ) {
		if ( rating - i >= 1 ) {
			var icon = "fa-star";
		}
		else {
			var icon = "fa-star-half";
		}
		ratingEl.append('<i class="fa ' + icon + '"></i>');
	}

	// Show random price (that matches the search value)
	var price = destination.price * 500 + Math.floor(Math.random()*500);

	var minimumPriceAllowed = 200;
	if ( price <= minimumPriceAllowed ) price += minimumPriceAllowed;

	destination.calculatedPrice = price;
	result.find('.price').html(price + '€');	
	result.attr('data-price', price);

	// Activities
	var activities = ['we-icon we-beach', 'fa fa-cutlery', 'fa fa-beer', 'fa fa-music', 'fa fa-shopping-cart', 'fa fa-asterisk'];
	var activitiesEl = result.find('.activities').html('');
	for ( var i = 0; i < destination.activities.length; i ++ ) {
		activitiesEl.append('<i class="' + activities[destination.activities[i]] + '"></i> ');
	}

	result.appendTo($('#search_results_list'));

	return destination;
}


// Filtering of the results
function filterResults() {

	// Price
	var lowPrice = parseFloat($('#price_slider').attr('data-low-value'));
	var highPrice = parseFloat($('#price_slider').attr('data-high-value'));

	// Temperature
	var lowTemperature = parseFloat($('#temperature_slider').attr('data-low-value'));
	var highTemperature = parseFloat($('#temperature_slider').attr('data-high-value'));

	var resultCount = 0;

	$('#search_results_list .result:not(#list_template)').each(function() {
		var el = $(this);
		
		var price = parseFloat(el.attr('data-price'));
		var temperature = parseFloat(el.attr('data-temperature'));

		if ( ( lowPrice <= price && highPrice >= price )
			&& ( lowTemperature <= temperature && highTemperature >= temperature ) ) {

			el.removeClass('hidden');

			if ( resultCount % 2 == 1 ) {
				el.addClass('odd');
			}
			else {
				el.removeClass('odd');
			}

			resultCount ++;
		}
		else {
			el.addClass('hidden');
		}
	});

	$('.results_count').html(resultCount);
}

// Search
var resultsPositionTop;
$('#search_button').hammer({
	// Prevent scrolling from being misinterpreted as tapping
	'tap_max_distance': 1
}).on('tap', function(e) {
	$('#search_results_list .result:not(#list_template)').remove();

	// Show loading
	$('#search_results_list .loading').show();

	// Back history
	addHistory("Results");
	onPopState("Results");

	setTimeout(function() {
		// Hide loading
		$('#search_results_list .loading').hide();

		// Search through the test data
		var maxBudget = parseFloat($('#max_budget').val());

		// Keep track of min & max values for filter view
		var minPrice = null;
		var maxPrice = null;
		var minTemperature = null;
		var maxTemperature = null;

		var resultCount = 0;

		for ( var i = 0; i < destinations.length; i ++ ) {
			var destination = destinations[i];

			// Price class is indicated by an integer 0-2
			// 0: 0€ - 500€
			// 1: 501€ - 1000€
			// 2: 1001€ -
			if ( ( maxBudget <= 500 && destination.price == 0 )
				|| ( maxBudget >= 501 && maxBudget <= 1000 && $.inArray(destination.price, [0, 1]) != -1 )
				|| ( maxBudget >= 1001 ) ) {
				
				destination = showDestination(destination, i);

				resultCount ++;

				if ( minPrice == null || minPrice > destination.calculatedPrice ) {
					minPrice = destination.calculatedPrice;
				}
				if ( maxPrice == null || maxPrice < destination.calculatedPrice ) {
					maxPrice = destination.calculatedPrice;
				}

				if ( minTemperature == null || minTemperature > destination.calculatedTemperature ) {
					minTemperature = destination.calculatedTemperature;
				}
				if ( maxTemperature == null || maxTemperature < destination.calculatedTemperature ) {
					maxTemperature = destination.calculatedTemperature;
				}
			}
		}

		// Update results count
		$('.results_count').html(resultCount);

		// Every other row with different background
		$('#search_results_list .result:not(#list_template):odd').addClass('odd');

		// Update the limits for the range filters
		$('#price_slider').attr('data-min', minPrice).attr('data-max', maxPrice);
		$('#temperature_slider').attr('data-min', minTemperature).attr('data-max', maxTemperature);
	}, 1000);

});

$('button.back').hammer().on('tap', function(e) {
	window.history.back();
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
					'q': destinationInDetailsView.city + ', ' + destinationInDetailsView.country,
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

// Swiping between tabs
$('#details_container').hammer({
	'swipe_velocity': 0.1
}).on('swipeleft', function() {
	showTab(currentActiveTab + 1);
}).on('swiperight', function() {
	showTab(currentActiveTab - 1);
});


// Open filter view
$('button.filter').hammer().on('tap', function(e) {
	addHistory("Filter");
	onPopState("Filter");
});
// Open sort view
$('button.sort').hammer().on('tap', function(e) {
	addHistory("Sort");
	onPopState("Sort");
});

// Initialize the range sliders
var filterSlidersInitialized = false;
function initializeFilterSliders() {

	$('.range_slider').each(function() {
		var el = $(this);

		var minValue = parseInt(el.attr('data-min'));
		var maxValue = parseInt(el.attr('data-max'));
		var unit = el.attr('data-unit');

		if ( !filterSlidersInitialized ) {
			el.append('<div><span class="low"><span>10€</span></span><span class="high"><span>100€</span></span></div>');
		}

		// Always ensure that min & max value are right
		el.find('.low span').html(minValue + unit);
		el.find('.high span').html(maxValue + unit);
		el.attr('data-low-value', minValue);
		el.attr('data-high-value', maxValue);

		if ( filterSlidersInitialized ) {
			return;
		}
		
		var fullWidth = el.width();
		var innerDiv = el.find('> div:first');
		innerDiv.css('width', fullWidth + 'px');

		// We need to keep track of the handle positions
		var lastPointLow = 0;
		var lastPointHigh = fullWidth;
	
		var handleWidth = 21;

		var lowValue;
		// Dragging of the low handle
		el.find('.low').hammer({
			'drag_min_distance': 1,
			'prevent_default': true
		}).on('drag', function(e) {
			var delta = e.gesture.deltaX;

			var minValue = parseInt(el.attr('data-min'));
			var maxValue = parseInt(el.attr('data-max'));

			var leftPos = lastPointLow + delta;
		
			// Prevent from dragging too far left & right	
			if ( leftPos < 0 ) leftPos = 0;
			else if ( leftPos > lastPointHigh - handleWidth ) leftPos = lastPointHigh - handleWidth;

			// Calculate the value
			var ratio = leftPos / (fullWidth - handleWidth);
			lowValue = Math.round(minValue + ratio * (maxValue - minValue));
			$(this).find('span').html(lowValue + unit);

			innerDiv.css({
				'left': leftPos + 'px',
				'width': lastPointHigh - leftPos + 'px'
			});
		}).on('dragend', function(e) {
			el.attr('data-low-value', lowValue);
			lastPointLow = parseFloat(innerDiv.css('left').replace('px',''));
			filterResults();
		});

		var highValue;
		// Dragging of the high handle
		el.find('.high').hammer({
			'drag_min_distance': 1,
			'prevent_default': true
		}).on('drag', function(e) {
			var delta = e.gesture.deltaX;

			var minValue = parseInt(el.attr('data-min'));
			var maxValue = parseInt(el.attr('data-max'));

			var width = lastPointHigh + delta;

			// Prevent from dragging too far left & right	
			if ( width < handleWidth + lastPointLow ) width = handleWidth + lastPointLow;
			else if ( width > fullWidth ) width = fullWidth;
	
			// Calculate the value
			var ratio = (width - handleWidth) / (fullWidth - handleWidth);
			highValue = Math.round(minValue + ratio * (maxValue - minValue));
			$(this).find('span').html(highValue + unit);

			innerDiv.css({
				'width': width - lastPointLow + 'px'
			});
		}).on('dragend', function(e) {
			el.attr('data-high-value', highValue);
			lastPointHigh = parseFloat(innerDiv.css('width').replace('px','')) + lastPointLow;
			filterResults();
		});
	});

	filterSlidersInitialized = true;

}
