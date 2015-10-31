$(function() {
	ymaps.ready(init);
	var myMap,
		coords,
		sevastopolCoords = [44.616761107740274, 33.52558107767834],
		placemarkStyle = {
			preset: 'islands#circleIcon',
			iconColor: '#3caa3c'},
		placemark;

	function init() { 

		coords = get_coords_from_href();
		if (coords === null) {
			coords = sevastopolCoords;
		}

		myMap = new ymaps.Map("map", {
			center: coords,
			zoom: 12,
			controls: ['smallMapDefaultSet']
		});

		$('#coord_lat').val(coords[0]);
		$('#coord_lon').val(coords[1]);
		$('#dist').val(1000);

		placemark = new ymaps.Placemark([coords[0], coords[1]], {
			balloonContent: '' + coords[0] + ', ' + coords[1]
			}, placemarkStyle);
		myMap.geoObjects.add(placemark);

		myMap.events.add('click', function (e) {
			coords = e.get('coords');
			var lat = coords[0],
				lon = coords[1];
			$('#coord_lat').val(lat);
			$('#coord_lon').val(lon);

			myMap.geoObjects.remove(placemark);
			placemark = new ymaps.Placemark([lat, lon],	{
				balloonContent: '' + lat + ', ' + lon
				}, placemarkStyle);
			myMap.geoObjects.add(placemark);
		});

		function wrap_photo(photo_url, inst_url, username) {
			var html =
				"<div class='uk-width-medium-1-2 uk-container-center'>" +
					"<div><img src='" + photo_url + "'/></div>" +
					"<div>" +
						"<a href='" + inst_url + "'>" + username.substring(0, 10) + "</a>" +
					"</div>" +
				"</div>"
			return html;
		}

		$('#button_photos').click(function(e) {
			e.preventDefault();
			var data = {
				'lat': $('#coord_lat').val(),
				'lon': $('#coord_lon').val(),
				'dist': $('#dist').val()
			};
			$.ajax({
				type: "POST",
				url: '/get_photos_ajax',
				data: data,
				success: function(result) {
					var media = result['media'];
					$('#photos').html('');
					for (var i = 0; i < media.length; ++i) {
						$('#photos').append(wrap_photo(media[i][0], media[i][1], media[i][2]));
					}
				},
				dataType: 'json'
			});
		});

		$('#share_button').click(function(e) {
			e.preventDefault();
			var lat = coords[0],
				lon = coords[1];
			var origin = window.location.origin;
			if (typeof(origin) === 'undefined') {
    			origin = window.location.protocol + '//' + window.location.host;
			}
			var link = origin + '#lat:' + lat +
				'#lon:' + lon;
			$('#share_link').text(link);
		});
	}

	function get_coords_from_href() {
		// parse link #lat:12.34#lon:45.67
		var href = window.location.href;
		if (href.indexOf('lat') != -1
			&& href.indexOf('lon') != -1) {
			var string_parts = href.split('#');
			var lat_string = string_parts[1],
				lon_string = string_parts[2];
			var lat = lat_string.substring(lat_string.indexOf(':') + 1, lat_string.length),
				lon = lon_string.substring(lon_string.indexOf(':') + 1, lon_string.length);
			return [lat, lon];
		} else {
			return null;
		}
	}
});