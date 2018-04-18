var proxy = require("http-proxy-middleware");
var winston = require('winston');

/**
 * Context matching: decide which path(s) should be proxied. (wildcards supported)
 **/
var context = '/';

/**
 * Proxy options
 */
var options = {
    // hostname to the target server
    target: 'http://localhost:5000',

    // set correct host headers for name-based virtual hosted sites
    changeOrigin: true,

    // enable websocket proxying
    ws: true,

    // additional request headers
    headers: {
        'x-powered-by': 'foobar'
    },

    // rewrite paths
    pathRewrite: {
        '^/api/old-path' : '/api/new-path',     // rewrite path
        '^/api/remove/path' : '/path'           // remove base path
    },

    // re-target based on the request's host header and/or path
    router: {
        'localhost:5001'         	 : 'http://localhost:5000'
    },

    // control logging
    logLevel: 'silent',

    // use a different lib for logging;
    // i.e., write logs to file or server
    logProvider: function (provider) {
        return winston;
    },

    // subscribe to http-proxy's error event
    onError: function onError(err, req, res) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err.toString());
    },

    // subscribe to http-proxy's proxyRes event
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['x-added'] = 'foobar';
        delete proxyRes.headers['x-removed'];
    },

    // subscribe to http-proxy's proxyReq event
    onProxyReq: function (proxyReq, req, res) {
        // add custom header to request
        proxyReq.setHeader('x-powered-by', 'foobar');
    }

    /**
     * The following options are provided by Nodejitsu's http-proxy
     */

    // target
    // forward
    // agent
    // ssl
    // ws
    // xfwd
    // secure
    // toProxy
    // prependPath
    // ignorePath
    // localAddress
    // changeOrigin
    // auth
    // hostRewrite
    // autoRewrite
    // protocolRewrite
    // headers

};

/**
 * Create the proxy middleware, so it can be used in a server.
 */
 
var express = require('express');
var apiProxy = proxy(context, options);
var app = express();
    app.use('/', apiProxy);

    app.listen(8001);