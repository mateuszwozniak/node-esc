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

    index: function (doc, cb) {
        this.request.put(doc._id, doc, cb);
    },

    delete: function (doc, cb) {
        var _id;
        if (typeof doc === 'string' || typeof doc === 'number') {
            _id = doc;
        } else {
            _id = doc._id;
            if (typeof _id === 'undefined' || typeof _id === 'object') {
                throw new TypeError('Can not delete document because it does not have _id');
            }
        }

        this.request.del(_id, cb);
    },

    update: function (id, config, cb) {
        this.request.post(id + '/_update', config, cb);
    },

    getById: function (id, cb) {
        if (!/^(number|string)$/.test(typeof id)) {
            throw new TypeError('Id must be number or string!');
        }
        this.request.get(id, cb);
    },

    mGetById: function (ids, cb) {
        if (!Array.isArray(ids)) {
            throw new TypeError('First argument of multi get requests must be of array type!');
        }

        this.request.get('_mget', {ids: ids}, cb);
    },

    mGet: function (docs, cb) {
        if (!Array.isArray(docs)) {
            throw new TypeError('First argument of multi get requests must be of array type!');
        }
        this.request.get('_mget', {docs: docs}, cb);
    },

    query: function (qs, data, cb) {
        this.request.get.apply(this.request, arguments);
    },

    search: function (config, cb) {
        this.query('_search', config, cb);
    }
};

module.exports = ESType;
