var map = null;
var markers = null;
var markersMap = {};

var searchMarker = null;

function initializeMap() {
    map = L.map('map', {
        wheelPxPerZoomLevel: 10,
        zoomSnap: 0.25,
        zoomDelta: 1
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markers = L.markerClusterGroup({ chunkedLoading: true });
    map.addLayer(markers);

    map.on('moveend', function (e) {
        if (!$('#map').is(':visible')) return;
        setTimeout(function () {
            if (searchMarker && map.hasLayer(searchMarker) && !map.getBounds().contains(searchMarker.getLatLng())) {
                map.removeLayer(searchMarker);
                searchMarker = null;

                $('#search-address').val('');
            }
        }, 500);

        onBoundariesUpdate(map.getBounds());
    });
}

function createMarker(coordinates) {
    var defaultPopupContent = '<p>Loading...</p>';

    var icon = L.AwesomeMarkers.icon({
        icon: propertyTypeToIcon(coordinates.type),
        prefix: 'flaticon',
        markerColor: 'red'
    });

    var marker = L.marker([coordinates.latitude, coordinates.longitude], { icon: icon });
    var popup = popup = L.popup().setContent(defaultPopupContent);
    var listingId = coordinates.listingId;
    marker.on('click', function (e) {
        var popup = e.target.getPopup();
        var existingContent = popup.getContent();
        if (existingContent != defaultPopupContent) return;

        $.ajax({
            url: '/property/' + listingId + '/popup',
            method: 'get'
        }).done(function (data) {
            popup.setContent(data);
            popup.update();
        })
    });

    marker.on('mouseover', function (e) {
        $(this._icon).addClass('awesome-marker-icon-purple');
        var $item = $('#search-results .properties[data-listing-id="' + listingId + '"]');
        if ($item.length === 0) return;

        $item.addClass('hovered');

        if (!e.fromList) {
            var $wrapper = $item.parent();
            $wrapper.parent().animate({
                scrollTop: $wrapper.position().top + $wrapper.parent().scrollTop()
            }, 500, 'swing');
        }
    });
    marker.on('mouseout', function (e) {
        $(this._icon).removeClass('awesome-marker-icon-purple');
        $('#search-results .properties[data-listing-id="' + listingId + '"]').removeClass('hovered');

    });

    marker.bindPopup(popup);

    return marker;
}

function _fireEventOnMarkerOrVisibleParentCluster(marker, eventName) {
    if (eventName === 'mouseover') {
        var visibleLayer = markers.getVisibleParent(marker);

        if (visibleLayer instanceof L.MarkerCluster) {
            markers.once('spiderfied', function () {
                marker.fire(eventName, { fromList: true });
            });

            if (visibleLayer.getChildCount() <= 10) {
                visibleLayer.spiderfy();
            } else {
                $(visibleLayer._icon).addClass('hovered');
            }
        } else {
            _unspiderfyPreviousClusterIfNotParentOf(marker);
            marker.fire(eventName, { fromList: true });
        }
    } else if (eventName === 'mouseout') {
        var visibleLayer = markers.getVisibleParent(marker);
        if (visibleLayer instanceof L.MarkerCluster) {
            $(visibleLayer._icon).removeClass('hovered');
        } else {
            _unspiderfyPreviousClusterIfParentOf(marker);
        }

        marker.fire(eventName, { fromList: true });
    } else {
        marker.fire(eventName, { fromList: true });
    }
}

function _unspiderfyPreviousClusterIfNotParentOf(marker) {
    var spiderfiedCluster = markers._spiderfied;

    if (spiderfiedCluster && !_clusterContainsMarker(spiderfiedCluster, marker)) {
        spiderfiedCluster.unspiderfy();
    }
}

function _unspiderfyPreviousClusterIfParentOf(marker) {
    var spiderfiedCluster = markers._spiderfied;

    if (spiderfiedCluster && _clusterContainsMarker(spiderfiedCluster, marker)) {
        spiderfiedCluster.unspiderfy();
    }
}

function _clusterContainsMarker(cluster, marker) {
    var currentLayer = marker;

    while (currentLayer && currentLayer !== cluster) {
        currentLayer = currentLayer.__parent;
    }

    return !!currentLayer;
}

function resizeMap() {
    if (!$('#map').is(':visible')) return;
    var height = $(window).height() - $('#search-listings').offset().top;

    $('#search-listings').height(height);
    $('#map').height(height);
    map.invalidateSize();
}

function updateFormBounds(bounds) {
    if (!bounds) return;
    $('#search-property-map-boundaries-north-east-latitude').val(bounds.getNorthEast().lat);
    $('#search-property-map-boundaries-north-east-longitude').val(bounds.getNorthEast().lng);
    $('#search-property-map-boundaries-south-west-latitude').val(bounds.getSouthWest().lat);
    $('#search-property-map-boundaries-south-west-longitude').val(bounds.getSouthWest().lng);
}

function onBoundariesUpdate(bounds) {
    if (!bounds) return;
    var args = {
        'requestType': 2,
        'Pagination.Page': 1,
        'Boundaries.NorthEast.Latitude': bounds.getNorthEast().lat,
        'Boundaries.NorthEast.Longitude': bounds.getNorthEast().lng,
        'Boundaries.SouthWest.Latitude': bounds.getSouthWest().lat,
        'Boundaries.SouthWest.Longitude': bounds.getSouthWest().lng
    }

    updateFormBounds(bounds);
    loadNewItems(args);
}

function submitSearchForm($form) {
    args = $form.serializeObject();
    args.requestType = 2;
    loadNewItems(args);
}

function loadNewItems(args) {
    var url = window.location.href;
    for (var arg in args) {
        if (args.hasOwnProperty(arg)) {
            url = updateURLParameter(url, arg, args[arg]);
        }
    }

    $.ajax({
        contentType: 'application/json',
        url: url,
        beforeSend: searchAjaxBegin,
        complete: function () {
            $('#search-loader').removeClass('show');
        },
        success: function (data) {
            window.history.replaceState('', '', updateURLParameter(url, 'requestType', '0'));
            $('#search-results').html(data.view);
            var existing = {};
            var startTime = (new Date()).valueOf();
            var markersToDraw = [];
            for (var i = 0; i < data.coordinates.length; i++) {
                var existingMarker = markersMap[data.coordinates[i].listingId];
                if (!existingMarker) {
                    var marker = createMarker(data.coordinates[i]);
                    markersMap[data.coordinates[i].listingId] = marker;
                    markersToDraw.push(marker);
                }

                existing[data.coordinates[i].listingId] = true;
            }

            markers.addLayers(markersToDraw);

            var markersToRemove = [];
            for (var listingId in markersMap) {
                if (markersMap.hasOwnProperty(listingId)) {
                    if (!existing[listingId]) {
                        markersToRemove.push(markersMap[listingId]);
                        delete markersMap[listingId];
                    }
                }
            }

            markers.removeLayers(markersToRemove);

            console.log('It took ' + ((new Date()).valueOf() - startTime) + 'ms to draw a map');
        }
    })
}

function searchAjaxBegin() {
    $('#search-loader').addClass('show');
}

function searchAjaxComplete() {
    $('#search-loader').removeClass('show');
    scrollToElement('#search-results');
    contentWayPoint();

    if (this instanceof Element || this instanceof HTMLDocument) {
        var text = $(this).text();
        try {
            var page = parseInt(text);
            window.history.replaceState('', '', updateURLParameter(window.location.href, "Pagination.Page", page.toString()));
        } catch { }
    }
}

function setSearchMarker(center) {
    var icon = L.AwesomeMarkers.icon({
        icon: 'button',
        prefix: 'flaticon',
        markerColor: 'orange'
    });

    if (!!searchMarker && map.hasLayer(searchMarker)) {
        map.removeLayer(searchMarker);
    }

    searchMarker = L.marker(center, { icon: icon });
    map.addLayer(searchMarker);
}

function onAddressChange(address) {
    $.ajax({
        url: '/api/Address?Address=' + encodeURIComponent(address),
        dataType: 'json',
        cache: true,
        success: function (coordinates) {
            var center = new L.LatLng(coordinates.latitude, coordinates.longitude);
            var bounds = center.toBounds(defaultMapRadius);

            map.fitBounds(bounds);
            setSearchMarker(center);

            updateFormBounds(map.getBounds());
        }
    });
}

$(document).ready(function () {
    initializeMap();

    // when the page loads
    autocollapse('#advanced-search-form-wrapper', '.form-field', 53);

    $("#advanced-search-form-wrapper ul.dropdown-menu").on("click", ".form-field", function (e) {
        e.stopPropagation();
    });

    function setDefaultMapView() {
        map.setView(defaultCoordinates, defaultMapZoom);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setTimeout(function() {
                    map.setView([position.coords.latitude, position.coords.longitude], defaultMapZoom);
                }, 200);
            });
        }
    }

    var neLat = $('#search-property-map-boundaries-north-east-latitude').val();
    var neLon = $('#search-property-map-boundaries-north-east-longitude').val();
    var swLat = $('#search-property-map-boundaries-south-west-latitude').val();
    var swLon = $('#search-property-map-boundaries-south-west-longitude').val();


    if (!neLat || !neLon || !swLat || !swLon) {
        setDefaultMapView();
    } else if (neLat && neLon && swLon && swLat) {
        var northEast = new L.LatLng(neLat, neLon);
        var southWest = new L.LatLng(swLat, swLon);
        var bounds = new L.LatLngBounds(northEast, southWest)
        if (bounds.isValid()) {
            map.fitBounds(bounds);
        } else {
            setDefaultMapView();
        }
    }
    else {
        setDefaultMapView();
    }

    var address = getQueryParameterByName('Address');
    if (!!address) {
        onAddressChange(address);
    }

    resizeMap();

    // when the window is resized
    $(window).on('resize', function () {
        autocollapse('#advanced-search-form-wrapper', '.form-field', 53);
        $(window).on('resize', resizeMap);
    });

    $('#advanced-search-form').on('submit', function (e) {
        e.preventDefault();
        submitSearchForm($(this))
    });

    $('#advanced-search-form').on('change', 'select, input:not([type="hidden"])', function (e) {
        e.preventDefault();
        submitSearchForm($(this).closest('form'));
    });

    $('#search-results').on("mouseover", '.properties', function (e) {
        var listingId = $(this).data('listingId');
        var marker = markersMap[listingId];
        _fireEventOnMarkerOrVisibleParentCluster(marker, 'mouseover');
    });
    $('#search-results').on("mouseout", '.properties', function (e) {
        var listingId = $(this).data('listingId');
        var marker = markersMap[listingId];
        _fireEventOnMarkerOrVisibleParentCluster(marker, 'mouseout');
    });
    $('#search-results').on('change', '#search-sort-by', function (e) {
        var sortBy = $(this).val();
        args = {
            requestType: 2,
            sortBy: sortBy
        }

        loadNewItems(args);
    });

    $('#search-address').typeahead(null, {
        source: getAddressSuggestionsEngine().ttAdapter(),
    });

    $('#search-address').bind('typeahead:select', function (event, selectedPlace) {
        onAddressChange(selectedPlace);
    });

    $('#search-listings [name="map-or-list"]').change(function () {
        $('#search-listings').removeClass('view-map').removeClass('view-list').addClass('view-' + this.value);
        if (this.value === 'map') resizeMap();
    });

});