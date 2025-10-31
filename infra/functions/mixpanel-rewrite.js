function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Remove /events/mp prefix and forward to Mixpanel
    if (uri.startsWith('/events/mp')) {
        request.uri = uri.replace('/events/mp', '');
        if (request.uri === '' || request.uri === '/') {
            request.uri = '/';
        }
    }
    
    // Transform CloudFront viewer headers to standard IP forwarding headers
    // that Mixpanel recognizes for proper geolocation
    var headers = request.headers;
    
    if (headers['cloudfront-viewer-address']) {
        var viewerAddress = headers['cloudfront-viewer-address'].value;
        // Extract IP address (remove port if present)
        var clientIP = viewerAddress.split(':')[0];
        
        // Set X-Forwarded-For header for proper IP forwarding
        headers['x-forwarded-for'] = { value: clientIP };
    }
    
    return request;
}
