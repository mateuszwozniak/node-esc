'use strict';

var request = require('request');
var resolveArgs = require('./util').resolveArgs;

function ESRequest(config) {
    if (!config) {
        throw new TypeError('Can not create ESRequest instance without config');
    }
    if (!config.esIndexUrl) {
        throw new TypeError('Can not create ESRequest instance without elasticsearch index url [config.esIndexUrl]');
    }

    this.esIndexUrl = config.esIndexUrl || '';
    this.typeName = config.typeName || '';

    initUrl.call(this);
}

function initUrl() {
    var endsWithSlash = /\/$/;
    var sep = this.esIndexUrl.match(endsWithSlash) ? '' : '/';
    this.url = this.esIndexUrl + sep;

    if (this.typeName) {
        this.url += this.typeName + (this.typeName.match(endsWithSlash) ? '' : '/');
    }
}

ESRequest.prototype = {
    constructor: ESRequest,

    get: function (qs, data, cb) {
        var args = resolveArgs(arguments);
        args.url = this.url + args.query;
        makeRequest('get', args);
    },
    post: function (qs, data, cb) {
        var args = resolveArgs(arguments);
        args.url = this.url + args.query;
        makeRequest('post', args);
    },
    put: function (qs, data, cb) {
        var args = resolveArgs(arguments);
        args.url = this.url + args.query;
        makeRequest('put', args);
    },
    del: function (qs, data, cb) {
        var args = resolveArgs(arguments);
        args.url = this.url + args.query;
        makeRequest('del', args);
    }
};

var respOkRegexp = /^2/;
function makeRequest(type, config) {
    var reqConfig = {
        json: true
    };

    if (config.data) {
        reqConfig.body = typeof config.data === 'object' ? JSON.stringify(config.data) : config.data;
    }

    request[type](config.url, reqConfig, function (err, resp, body) {
        if (err || respOkRegexp.test(resp.statusCode)) {
            return config.cb(err, body);
        } else {
            return config.cb(body, null);
        }
    });
}

module.exports = ESRequest;