function sendEvent(eventType, listingId) {
    var httpRequest = new XMLHttpRequest();
    var url = '/api/Analytics?type=' + eventType;
    if (!!listingId) url += '&listingId=' + listingId

    httpRequest.open('GET', url);
    httpRequest.send();
}