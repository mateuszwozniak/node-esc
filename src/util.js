'use strict';

module.exports = {

    resolveArgs: function resolveArgs(a) {
        var args = [].slice.call(a);
        var resolved = {
            cb: null,
            query: '',
            data: null
        };

        // check last param if it's function
        var last = args.pop();

        if (typeof last !== 'function') {
            throw TypeError('Can not call get without callback');
        } else {
            resolved.cb = last;
        }

        if (!args.length) {
            return resolved;
        }

        // check first param - it can be string (then use it as query) or object (then use it as data)
        var first = args.shift();
        if (typeof first === 'string' || typeof first === 'number') {
            resolved.query = first;
            resolved.data = args[0] || null
        } else {
            resolved.data = first;
        }

        return resolved;
    }
};