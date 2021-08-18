$(document).ready(function () {
    $('#quick-search').typeahead(null,
        {
            name: propertiesDatasetName,
            source: getPropertiesSuggestionsEngine(),
            display: getPropertySuggestionAddress,
            templates: {
                header: '<h3 class="tt-suggestion">Properties</h3>',
                suggestion: formatPropertySuggestion
            }
        },
        {
            source: getAddressSuggestionsEngine().ttAdapter(),
            name: addressesDatasetName,
            templates: {
                header: '<h3 class="tt-suggestion">Places</h3>'
            }
        });

    $('#quick-search').bind('typeahead:select', function (event, selected, dataset) {
        if (dataset == addressesDatasetName) {
            var url = '/property/search?Address=' + encodeURIComponent(selected);
            window.location.href = url;
        } else if (dataset === propertiesDatasetName) {
            window.location.href = '/property/' + selected.listingId;;
        }
    });

    $('#home-worth-address').typeahead(null,
        {
            source: getAddressSuggestionsEngine().ttAdapter(),
            name: addressesDatasetName,
        });

    $('#home-worth-address').bind('typeahead:select', function (event, selected, dataset) {
        var url = '/home-worth?address=' + encodeURIComponent(selected);
        window.location.href = url;
    });
});