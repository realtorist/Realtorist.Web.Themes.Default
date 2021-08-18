window.defaultMapRadius = 10 * 1000; // 10km
window.defaultMapZoom = 12;
window.defaultCoordinates = [45.424721, -75.695000]; // Ottawa downtown

window.addressesDatasetName = 'addresses';
window.propertiesDatasetName = 'properties';

function propertyTypeToIcon(type) {
    switch (type) {
        case 300: return 'house';
        case 301: return 'bike-path';
        case 302: return 'agricultural';
        case 303: return 'land';
        case 304: return 'building';
        case 305: return 'market';
        case 306: return 'briefcase';
        case 307: return 'factory';
        case 308: return 'parking-area';
        case 309: return 'building-1';
        case 310: return 'town';
        case 312: return 'hotel';
        default: return 'button';
    }
}

function formatPhotonSuggestion(feature) {
    var streetAddress = [];
    var str = [];

    if (feature.properties.housenumber) streetAddress.push(feature.properties.housenumber);
    if (feature.properties.street) streetAddress.push(feature.properties.street);

    var streetAddressStr = streetAddress.join(' ');
    if (streetAddressStr) str.push(streetAddressStr);

    if (feature.properties.city) str.push(feature.properties.city);
    if (feature.properties.county) str.push(feature.properties.county);
    if (feature.properties.state) str.push(feature.properties.state);
    if (feature.properties.postcode) str.push(feature.properties.postcode);
    if (feature.properties.country) str.push(feature.properties.country);

    return str.join(', ');
}

function getPropertySuggestionAddress(suggestion) {
    var str = [];

    if (suggestion.address.streetAddress) str.push(suggestion.address.streetAddress);
    if (suggestion.address.communityName) str.push(suggestion.address.communityName);
    if (suggestion.address.neighbourhood) str.push(suggestion.address.neighbourhood);
    if (suggestion.address.city) str.push(suggestion.address.city);
    if (suggestion.address.province) str.push(suggestion.address.province);
    if (suggestion.address.postalCode) str.push(suggestion.address.postalCode);

    return str.join(', ');
}

function formatPropertySuggestion(suggestion) {
    return '<div>' + getPropertySuggestionAddress(suggestion) + '<div><small>MLS&reg; Number: ' + suggestion.mlsNumber + '</small></div></div>'
}

function getPhotonAddressSuggestionsEngine() {
    return new PhotonAddressEngine({
        lang: 'en',
        osm_tag: 'place',
        formatResult: formatPhotonSuggestion
    });
}

function geHereAddressSuggestionsEngine() {
    return new HereAddressEngine({
        lang: 'en',
        in: 'countryCode:CAN',
        apiKey: ''
    });
}

function getAddressSuggestionsEngine() {
    return new AddressEngine({});
}

function getPropertiesSuggestionsEngine() {
    return new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('mlsNumber'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'Property/Suggestions?query=%QUERY',
            wildcard: '%QUERY'
        }
    });
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}