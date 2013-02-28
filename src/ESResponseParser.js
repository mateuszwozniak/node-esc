'use strict';

function parse(resp) {
    var parsed = {
        error: null,
        result: null
    };
    var result = null;

    // return error when passed argument isn't object
    if (typeof resp !== 'object') {
        parsed.error = resp;
        return parsed;
    }


    if (resp.docs) {
        result = parseDocs(resp.docs);
    } else if (resp.hits) {
        result = parseDocs(resp.hits.hits);
    } else {
        result = parseObject(resp);
    }
    parsed.result = result;

    return parsed;
}

function parseDocs(docs) {
    var results = [];

    docs.forEach(function parseDoc(doc) {
        var docContent = parseObject(doc);
        docContent && results.push(docContent);
    });

    return results;
}

function parseObject(obj) {
    return (obj.exists !== false) ? obj._source : null;
}

module.exports = {
    parse: parse
};