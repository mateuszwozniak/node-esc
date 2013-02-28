'use strict';

var parse = require('./ESResponseParser').parse;
var ESRequest = require('./ESRequest');

function ESType(config) {
    if (!config) {
        throw new TypeError('Can not create ESRequest instance without config');
    }
    if (!config.esIndexUrl) {
        throw new TypeError('Can not create ESRequest instance without elasticsearch index url [config.esIndexUrl]');
    }
    if (!config.typeName) {
        throw new TypeError('Can not create ESRequest instance without typeName [config.typeName]');
    }

    this.request = new ESRequest(config);
}

ESType.prototype = {

    constructor: ESType,

    query: function (qs, data, cb) {
        this.request.get.apply(this.request, arguments);
    },

    searchRaw: function (config, cb) {
        this.query('_search', config, cb);
    },

    search: function (config, cb) {
        this.searchRaw(config, function (err, resp) {
            if (err) {
                return cb(err, null);
            }
            var parsed = parse(resp);
            cb(parsed.error, parsed.result);
        });
    },

    getById: function (id, cb) {
        this.getByIdRaw(id, function (err, resp) {
            if (err) {
                return cb(err, null);
            }
            var parsedResp = parse(resp);
            cb(parsedResp.error, parsedResp.result);
        });
    },

    getByIdRaw: function (id, cb) {
        if (!/^(number|string)$/.test(typeof id)) {
            throw new TypeError('Id must be number or string!');
        }
        this.request.get(id, cb);
    },

    mGetById: function (ids, cb) {
        this.mGetByIdRaw(ids, function (err, resp) {
            if (err) {
                return cb(err, null);
            }
            var parsedResp = parse(resp);
            cb(parsedResp.error, parsedResp.result);
        });
    },

    mGetByIdRaw: function (ids, cb) {
        if (!Array.isArray(ids)) {
            throw new TypeError('First argument of multi get requests must be of array type!');
        }

        this.request.get('_mget', {ids: ids}, cb);
    },

    mGet: function (docs, cb) {
        this.mGetRaw(docs, function (err, resp) {
            if (err) {
                return cb(err, null);
            }
            var parsedResp = parse(resp);
            cb(parsedResp.error, parsedResp.result);
        })
    },

    mGetRaw: function (docs, cb) {
        if (!Array.isArray(docs)) {
            throw new TypeError('First argument of multi get requests must be of array type!');
        }
        this.request.get('_mget', {docs: docs}, cb);
    }
};

module.exports = ESType;
