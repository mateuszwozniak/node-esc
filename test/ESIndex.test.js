'use strict';

var ESIndex = require('../src/ESIndex');
var ESType = require('../src/ESType');

var indexUrl = 'http://example.com/myindex/';

describe('ESIndex', function () {

    it('should throw error when created without index url', function () {
        expect(function () { new ESIndex(); }).to.throw(TypeError);
    });

    it('should set correct property "indexUrl" for instance', function () {
        var esi = new ESIndex(indexUrl);
        expect(esi.indexUrl).to.be.equal(indexUrl);
    });

    describe('addType()', function () {

        it('should create property with passed name inside instance', function () {
            var esi = new ESIndex(indexUrl);
            esi.addType('mytype');
            expect(esi.mytype).to.be.an('object');
        });

        it('created property should be an instance of ESType', function () {
            var esi = new ESIndex(indexUrl);
            esi.addType('mytype');
            expect(esi.mytype).to.be.instanceof(ESType);
        });

        it('should add passed properties to created ESType instance', function () {
            var properties = {
                foo: function () {},
                bar: 'baz'
            };
            var esi = new ESIndex(indexUrl);
            esi.addType('mytype', properties);

            expect(esi.mytype.foo).to.deep.equal(properties.foo);
            expect(esi.mytype.bar).to.deep.equal(properties.bar);
        });

    });
});
