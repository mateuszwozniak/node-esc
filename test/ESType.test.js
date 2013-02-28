'use strict';

var nock = require('nock');
var ESType = require('../src/ESType');

var esServerUrl = 'http://example.com/';
var indexName = 'myindex';

var esIndexConfig = {
    esIndexUrl: esServerUrl + indexName + '/',
    typeName: 'people'
};

describe('ESType', function () {


    it('should throw error when config was not passed', function () {
        expect(function () { new ESType(); }).to.throw(TypeError);
    });

    it('should throw error when elasticsearch index url was not passed', function () {
        expect(function () { new ESType({}); }).to.throw(TypeError);
    });

    it('should throw error when typeName was not passed', function () {
        expect(function () { new ESType({esIndexUrl: 'test'}); }).to.throw(TypeError);
    });

    describe('getByIdRaw()', function () {

        it('should call index with correct type name', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // check only path to be index_name/type_name, the rest of url does not matter
                .filteringPath(function (path) {
                    if (/myindex\/people/.test(path)) {
                        return '/myindex/people/';
                    }
                })
                .get('/myindex/people/')
                .reply(200);

            est.getByIdRaw(1, function (err, data) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should ask for document with passed index', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .get('/myindex/people/1')
                .reply(200);

            est.getByIdRaw(1, function (err, data) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should return raw response from es index', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {exists: false};
            var server = nock(esServerUrl)
                .get('/myindex/people/1')
                .reply(200, resp);

            est.getByIdRaw(1, function (err, data) {
                expect(data).to.deep.equal(resp);
                done();
            });
        });

        it('should throw error when passed id is not string or number', function () {
            var est = new ESType(esIndexConfig);
            expect(function () {
                est.getByIdRaw({}, function () {});
            }).to.throw(TypeError);
        });
    });

    describe('getById()', function () {

        it('should return null when document does not exists', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {exists: false};
            var server = nock(esServerUrl)
                .get('/myindex/people/1')
                .reply(200, resp);

            est.getById(1, function (err, doc) {
                expect(doc).to.be.a('null');
                done();
            });
        });

        it('should return content of _source property when document exists', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {_id: 1, foo: 'bar'};
            var server = nock(esServerUrl)
                .get('/myindex/people/1')
                .reply(200, {exists: true, _source: resp});

            est.getById(1, function (err, doc) {
                expect(doc).to.deep.equal(resp);
                done();
            });
        });
    });

    describe('mGetByIdRaw()', function () {

        it('should call es with _mget param', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // skip parameters
                .filteringRequestBody(function (body) { return undefined; })
                .get('/myindex/people/_mget')
                .reply(200);

            est.mGetByIdRaw([], function (err, data) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should throw error when first parameter is not an array', function () {
            var est = new ESType(esIndexConfig);
            expect(function () { est.mGetByIdRaw(1); }).to.throw(TypeError);
        });

        it('should return raw response from es index', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 0, exists: false}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {ids: [0]})
                .reply(200, resp);

            est.mGetByIdRaw([0], function (err, data) {
                expect(data).to.deep.equal(resp);
                done();
            });
        });

        it('should return entries for all asked ids (even if documents are not exist)', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 0, exists: false}, {_id: 1, exists: true}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {ids: [0]})
                .reply(200, resp);

            est.mGetByIdRaw([0], function (err, data) {
                expect(data.docs).to.have.length(2);
                done();
            });
        });
    });

    describe('mGetById()', function () {

        it('should return empty array when requested documents do not exist', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 1, exists: false}, {_id: 2, exists: false}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {ids: [1,2]})
                .reply(200, resp);

            est.mGetById([1,2], function (err, docs) {
                expect(docs).to.be.an('array');
                expect(docs).to.have.length(0);
                done();
            });
        });

        it('should return array without documents that do not exist', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 1, exists: false}, {_id: 2, exists: true, _source: {}}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {ids: [1,2]})
                .reply(200, resp);

            est.mGetById([1,2], function (err, docs) {
                expect(docs).to.be.an('array');
                expect(docs).to.have.length(1);
                done();
            });
        });
    });

    describe('mGetRaw()', function () {

        it('should call es with _mget param', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // skip parameters
                .filteringRequestBody(function (body) { return undefined; })
                .get('/myindex/people/_mget')
                .reply(200);

            est.mGetRaw([], function (err, data) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should throw error when first parameter is not an array', function () {
            var est = new ESType(esIndexConfig);
            expect(function () { est.mGetRaw(1); }).to.throw(TypeError);
        });

        it('should insert first param as "docs" property of query object', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {docs: [{}]})
                .reply(200);

            est.mGetRaw([{}], function (err, data) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should return raw response from es index', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 0, exists: false}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {docs: [{_id: 1}]})
                .reply(200, resp);

            est.mGetRaw([{_id: 1}], function (err, data) {
                expect(data).to.deep.equal(resp);
                done();
            });
        });

        it('should return entries for all asked ids (even if documents are not exist)', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 0, exists: false}, {_id: 1, exists: true}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {docs: [{}, {}]})
                .reply(200, resp);

            est.mGetRaw([{}, {}], function (err, data) {
                expect(data.docs).to.have.length(2);
                done();
            });
        });
    });

    describe('mGet()', function () {

        it('should return empty array when requested documents do not exist', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 1, exists: false}, {_id: 2, exists: false}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {docs: [{_id:1},{_id:2}]})
                .reply(200, resp);

            est.mGet([{_id: 1}, {_id:2}], function (err, docs) {
                expect(docs).to.be.an('array');
                expect(docs).to.have.length(0);
                done();
            });
        });

        it('should return array without documents that do not exist', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 1, exists: false}, {_id: 2, exists: true, _source: {}}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {docs: [{_id:1},{_id:2}]})
                .reply(200, resp);

            est.mGet([{_id:1},{_id:2}], function (err, docs) {
                expect(docs).to.be.an('array');
                expect(docs).to.have.length(1);
                done();
            });
        });
    });

    describe('query()', function () {

        it('should call es index with first param added to url, when it is string', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .get('/myindex/people/_testParam')
                .reply(200);

            est.query('_testParam', function (err, resp) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should first param as query object when if is an object', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .get('/myindex/people/', {_id: 1})
                .reply(200);

            est.query({_id: 1}, function (err, resp) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should pass first param as query string and second as query object when both are specified', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .get('/myindex/people/_test', {_id: 1})
                .reply(200);

            est.query('_test', {_id: 1}, function (err, resp) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should pass error to callback if server responded with error', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .get('/myindex/people/_test', {_id: 1})
                .reply(500, {error: 'error'});

            est.query('_test', {_id: 1}, function (err, resp) {
                expect(err).not.to.be.an('undefined');
                expect(err).not.to.be.a('null');
                done();
            });

        });

        it('should return raw results from es index', function (done) {
            var est = new ESType(esIndexConfig);
            var result = {docs: [{_id: 1}, {_id: 2}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_test', {_id: 1})
                .reply(200, result);

            est.query('_test', {_id: 1}, function (err, resp) {
                expect(resp).to.deep.equal(result);
                done();
            });
        });
    });

    describe('searchRaw()', function () {

        it('should send request with _search command in url', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // truncate parameters
                .filteringRequestBody(function () { return undefined; })
                .get('/myindex/people/_search')
                .reply(200);

            est.searchRaw({}, function (err, resp) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should send passed configuration object as request body', function (done) {
            var est = new ESType(esIndexConfig);
            var query = {query: {term: {name: 'foo'}}};
            var server = nock(esServerUrl)
                .get('/myindex/people/_search', query)
                .reply(200);

            est.searchRaw(query, function (err, docs) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should return full response from es', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {hits: {hits: [{_id: 1, exists: false}, {_id: 2, exists: false}]}};
            var query = {query: {term: {name: 'foo'}}};
            var server = nock(esServerUrl)
                .get('/myindex/people/_search', query)
                .reply(200, resp);

            est.searchRaw(query, function (err, result) {
                expect(result).to.deep.equal(resp);
                done();
            });

        });
    });

    describe('search()', function () {

        it('should return array of hits contents', function (done) {
            var est = new ESType(esIndexConfig);
            var content = [{_id: 1, name: 'foo'}, {_id: 2, name: 'foobar'}];
            var resp = {hits: {hits: [{_source: content[0]}, {_source: content[1]}]}};
            var query = {query: {term: {name: 'foo'}}};
            var server = nock(esServerUrl)
                .get('/myindex/people/_search', query)
                .reply(200, resp);

            est.search(query, function (err, result) {
                expect(result).to.deep.equal(content);
                done();
            });

        });
    });

});