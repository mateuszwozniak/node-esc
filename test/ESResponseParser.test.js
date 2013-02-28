'use strict';

var parser = require('../src/ESResponseParser');

describe('ESResponseParser', function () {
    describe('parse()', function () {

        it ('should return object with fiels error and result', function () {
            var output = parser.parse({});
            expect(output.error).not.to.be.an('udefined');
            expect(output.error).not.to.be.an('udefined');
        });

        it('should return error when called with non object', function () {
            expect(parser.parse('some error').error).to.equal('some error');
        });

        it('should return array when invoked with collection result', function () {
            var data = {docs: []};
            expect(parser.parse(data).result).to.be.an('array');
        });

        it('should return data from _source field for one object', function () {
            var content = {name: 'foo', id: 1};
            var data = {_id: 1, _source: content, exists: true};

            expect(parser.parse(data).result).to.deep.equal(content);
        });

        it('should return null if object does not exists', function () {
            var data = {_id: 0, exists: false};
            expect(parser.parse(data).result).to.be.a('null');
        });

        it('should return content from _source for all items in array', function () {
            var content = [{name: 'foo', _id: 0}, {name: 'bar', _id: 1}];
            var data = {docs: [{_id:0, _source: content[0], exists: true}, {_id: 1, _source: content[1], exists: true}]};

            expect(parser.parse(data).result).to.deep.equal(content);
        });

        it('should skip non existing objects', function () {
            var content = [{name: 'foo', _id: 0}, {name: 'bar', _id: 1}];
            var data = {docs: [{_id:0, _source: content[0], exists: true}, {_id: 1, _source: content[1], exists: true}, {_id: 2, exists: false}]};

            expect(parser.parse(data).result).to.have.length(2);
        });

        it('should return array of hits content when invoked with search results', function () {
            var content = [{name: 'foo', _id: 0}, {name: 'bar', _id: 1}];
            var data = {
                hits: {
                    hits: [
                        {
                            _id: 0,
                            _source: content[0]
                        },
                        {
                            _id: 1,
                            _source: content[1]
                        }

                    ]
                }
            };

            expect(parser.parse(data).result).to.have.length(2);
        });
    });
});
