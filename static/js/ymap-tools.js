$(function() {
	ymaps.ready(init);
	var myMap,
		sevastopolCoords = [44.616761107740274, 33.52558107767834],
		placemarkStyle = {
			preset: 'islands#circleIcon',
			iconColor: '#3caa3c'},
		placemark;

	function init() { 
		myMap = new ymaps.Map("map", {
			center: sevastopolCoords,
			zoom: 12,
			controls: ['smallMapDefaultSet']
		});

		$('#coord_lat').val(sevastopolCoords[0]);
		$('#coord_lon').val(sevastopolCoords[1]);
		$('#dist').val(1000);

		placemark = new ymaps.Placemark([sevastopolCoords[0], sevastopolCoords[1]], {
			balloonContent: '' + sevastopolCoords[0] + ', ' + sevastopolCoords[1]
			}, placemarkStyle);
		myMap.geoObjects.add(placemark);

		myMap.events.add('click', function (e) {
			var coords = e.get('coords');
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
		})

	}
});