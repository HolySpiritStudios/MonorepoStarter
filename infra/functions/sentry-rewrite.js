function handler(event) {
    var request = event.request;
    var uri = request.uri;
    var headers = request.headers;
    
    // For Sentry tunneling, we need to forward to /api/1/envelope/ endpoint
    // The Sentry SDK sends all tunnel requests to /events/st regardless of the actual endpoint
    if (uri.startsWith('/events/st')) {
        // Strip the /events/st prefix
        var remainingPath = uri.substring('/events/st'.length);
        
        // If there's a remaining path (like /api/1/envelope/), use it
        // Otherwise, default to the envelope endpoint which is what Sentry typically uses
        if (remainingPath === '' || remainingPath === '/') {
            request.uri = '/api/1/envelope/';
        } else {
            request.uri = remainingPath;
        }
    }
    
    // Handle IP forwarding for proper geolocation
    if (headers['cloudfront-viewer-address']) {
        var viewerAddress = headers['cloudfront-viewer-address'].value;
        var clientIP = viewerAddress.split(':')[0];
        headers['x-forwarded-for'] = { value: clientIP };
    }
    
    return request;
}
