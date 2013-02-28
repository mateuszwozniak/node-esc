'use strict';

var ESType = require('./ESType');
var ESRequest = require('./ESRequest');

function ESIndex (indexUrl) {
    if (typeof indexUrl !== 'string') {
        throw new TypeError('Can not create ESIndex instance without index url!');
    }
    // make sure that url has / on the end
    this.indexUrl = indexUrl + (/\/$/.test(indexUrl) ? '' : '/');
    this.request = new ESRequest({esIndexUrl: this.indexUrl});
}

ESIndex.prototype = {
    constructor: ESIndex,

    query: function (qs, data, cb) {
        this.request.get.apply(this.request, arguments);
    },

    search: function (config, cb) {
        this.query('_search', config, cb);
    },

    addType: function (typeName, extend) {
        this[typeName] = new ESType({
            esIndexUrl: this.indexUrl,
            typeName: typeName
        });

        if (typeof extend === 'object') {
            injectProperties(this[typeName], extend);
        }
    }
};

function injectProperties(base, properties) {
    var keys = Object.keys(properties);
    keys.forEach(function injectProperty(propertyName) {
        base[propertyName] = properties[propertyName];
    });
}

module.exports = ESIndex;
