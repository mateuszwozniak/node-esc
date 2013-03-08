'use strict';

var nock = require('nock');
var ESType = require('../src/ESType');

var esServerUrl = 'http://example.com/';
var indexName = 'myindex';

var esIndexConfig = {
    esIndexUrl: esServerUrl + indexName + '/',
    typeName: 'people'
};

function skipArgsInPath(path) {
    if (/myindex\/people/.test(path)) {
        return '/myindex/people/';
    }
}

function skipRequestBody(body) {
    return undefined;
}

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

    describe('index()', function () {

        it('should call server with PUT request', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .filteringPath(skipArgsInPath)
                .filteringRequestBody(skipRequestBody)
                .put('/myindex/people/')
                .reply(200);

            est.index({}, function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should add document _id on the end of url when document has set _id', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .filteringRequestBody(skipRequestBody)
                .put('/myindex/people/1')
                .reply(200);

            est.index({_id: 1}, function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should send passed data to server', function (done) {
            var est = new ESType(esIndexConfig);
            var data = {_id: 1, foo: 'bar'};
            var server = nock(esServerUrl)
                .put('/myindex/people/1', data)
                .reply(200);

            est.index(data, function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });
    });

    describe('delete()', function () {

        it('should call server with DELETE request', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .filteringPath(skipArgsInPath)
                .filteringRequestBody(skipRequestBody)
                .delete('/myindex/people/')
                .reply(200);

            est.delete(1, function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should add first param as id to url when it is string', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .filteringRequestBody(skipRequestBody)
                .delete('/myindex/people/1')
                .reply(200);

            est.delete('1', function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should add first param as id to url when it is number', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .filteringRequestBody(skipRequestBody)
                .delete('/myindex/people/1')
                .reply(200);

            est.delete(1, function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should add _id property as id to url when first param is object', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .filteringRequestBody(skipRequestBody)
                .delete('/myindex/people/1')
                .reply(200);

            est.delete({_id: 1}, function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should throw error when passed document does not have _id', function () {
            var est = new ESType(esIndexConfig);
            expect(function () { est.delete({}, function () {}); }).to.throw(TypeError);
        });
    });

    describe('getById()', function () {

        it('should call index with correct type name', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // check only path to be index_name/type_name, the rest of url does not matter
                .filteringPath(skipArgsInPath)
                .get('/myindex/people/')
                .reply(200);

            est.getById(1, function (err, data) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should ask for document with passed index', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .get('/myindex/people/1')
                .reply(200);

            est.getById(1, function (err, data) {
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

            est.getById(1, function (err, data) {
                expect(data).to.deep.equal(resp);
                done();
            });
        });

        it('should throw error when passed id is not string or number', function () {
            var est = new ESType(esIndexConfig);
            expect(function () {
                est.getById({}, function () {});
            }).to.throw(TypeError);
        });
    });

    describe('mGetById()', function () {

        it('should call es with _mget param', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // skip parameters
                .filteringRequestBody(skipRequestBody)
                .get('/myindex/people/_mget')
                .reply(200);

            est.mGetById([], function (err, data) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should throw error when first parameter is not an array', function () {
            var est = new ESType(esIndexConfig);
            expect(function () { est.mGetById(1); }).to.throw(TypeError);
        });

        it('should return raw response from es index', function (done) {
            var est = new ESType(esIndexConfig);
            var resp = {docs: [{_id: 0, exists: false}]};
            var server = nock(esServerUrl)
                .get('/myindex/people/_mget', {ids: [0]})
                .reply(200, resp);

            est.mGetById([0], function (err, data) {
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

            est.mGetById([0], function (err, data) {
                expect(data.docs).to.have.length(2);
                done();
            });
        });
    });

    describe('mGet()', function () {

        it('should call es with _mget param', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // skip parameters
                .filteringRequestBody(skipRequestBody)
                .get('/myindex/people/_mget')
                .reply(200);

            est.mGet([], function (err, data) {
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

            est.mGet([{}], function (err, data) {
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

            est.mGet([{_id: 1}], function (err, data) {
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

            est.mGet([{}, {}], function (err, data) {
                expect(data.docs).to.have.length(2);
                done();
            });
        });
    });


    describe('update()', function () {
        it('should call server with POST request', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                .filteringPath(skipArgsInPath)
                .filteringRequestBody(skipRequestBody)
                .post('/myindex/people/')
                .reply(200);

            est.update('1', {}, function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should call server with id and _update method in url', function (done) {
            var est = new ESType(esIndexConfig);
            var data = {_id: 1, foo: 'bar'};
            var server = nock(esServerUrl)
                .post('/myindex/people/1/_update', data)
                .reply(200);

            est.update('1', data, function (err, result) {
                expect(server.isDone()).to.be.true;
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

        it('should pass first param as query object when if is an object', function (done) {
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

    describe('search()', function () {

        it('should send request with _search command in url', function (done) {
            var est = new ESType(esIndexConfig);
            var server = nock(esServerUrl)
                // truncate parameters
                .filteringRequestBody(skipRequestBody)
                .get('/myindex/people/_search')
                .reply(200);

            est.search({}, function (err, resp) {
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

            est.search(query, function (err, docs) {
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

            est.search(query, function (err, result) {
                expect(result).to.deep.equal(resp);
                done();
            });

        });
    });


});