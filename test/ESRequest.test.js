/*global expect:false */
'use strict';

var nock = require('nock');

var ESRequest = require('../src/ESRequest');

var validConfig = {esIndexUrl: 'http://test.com/myindex'};
var validConfigWithType = {esIndexUrl: 'http://test.com/myindex', typeName: 'people'};

describe('ESRequest', function () {

    it('should throw error when config was not passed', function () {
        expect(function () { new ESRequest(); }).to.throw(TypeError);
    });

    it('should throw error when elasticsearch index url was not passed', function () {
        expect(function () { new ESRequest({}); }).to.throw(TypeError);
    });

    it('should set url property to esIndexUrl with slash on the end when typeName was not passed', function () {
        var r1 = new ESRequest({esIndexUrl: 'test-url'});
        expect(r1.url).to.equal('test-url/');

        var r2 = new ESRequest({esIndexUrl: 'test-url/'});
        expect(r2.url).to.equal('test-url/');
    });

    it('should set url property to esIndexUrl + typeName when type name was passed', function () {
        var r = new ESRequest({esIndexUrl: 'test-url', typeName: 'testType'});
        expect(r.url).to.equal('test-url/testType/');
    });

    describe('get()', function () {

        it('should throw an error when last param is not a function', function () {
            var r = new ESRequest(validConfig);
            expect(function () {r.get();}).to.throw(TypeError);
        });

        it('should call callback when request is finished', function (done) {
            var server = nock(validConfig.esIndexUrl)
                .get('/myindex/')
                .reply(200);

            var r = new ESRequest(validConfig);
            r.get(function () {
                // timeout will fail the test when done won't be called
                done();
            });
        });

        it('should call server with GET method', function (done) {
            var r = new ESRequest({esIndexUrl: 'http://example.com'});
            var server = nock('http://example.com')
                .get('/')
                .reply(200);

            r.get(function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should pass error to callback if request fails', function (done) {
            var r = new ESRequest({esIndexUrl: 'http://i-hope-that-url-does-not-exists.com'});

            r.get(function (err, result) {
                expect(err).to.be.an('object');
                expect(err).not.to.be.a('null');
                done();
            });
        });

        it('should pass error to callback if server responds with error', function (done) {
            var error = {error: 'some error'};
            var server = nock(validConfig.esIndexUrl)
                .get('/myindex/')
                .reply(500, error);

            var r = new ESRequest(validConfig);

            r.get(function (err, result) {
                expect(err).to.deep.equal(error);
                done();
            });
        });

        it('should pass response body as json to callback', function (done) {
            var server = nock(validConfig.esIndexUrl)
                .get('/myindex/')
                .reply(200, JSON.stringify({success: true}));

            var r = new ESRequest(validConfig);
            r.get(function (err, resp) {
                expect(resp.success).to.be.true;
                done();
            });
        });

        it('should append first parameter to url when it is a string', function (done) {
            var server = nock(validConfigWithType.esIndexUrl)
                .get('/myindex/people/123')
                .reply(200);

            var r = new ESRequest(validConfigWithType);
            r.get('123', function (err, resp) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should append first parameter to url when it is a number', function (done) {
            var server = nock(validConfigWithType.esIndexUrl)
                .get('/myindex/people/123')
                .reply(200);

            var r = new ESRequest(validConfigWithType);
            r.get(123, function (err, resp) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        it('should pass fist argument as request body when it is an object', function (done) {
            var server = nock(validConfigWithType.esIndexUrl)
                .get('/myindex/people/', {foo:1, bar:2})
                .reply(200);

            var r = new ESRequest(validConfigWithType);
            r.get({foo:1, bar:2}, function (err, resp) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

    });

    describe('post()', function () {

        it('should call server with POST method', function (done) {
            var r = new ESRequest({esIndexUrl: 'http://example.com'});
            var server = nock('http://example.com')
                .post('/')
                .reply(200);

            r.post(function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        // the rest of behavior is tested with get method
    });

    describe('put()', function () {

        it('should call server with PUT method', function (done) {
            var r = new ESRequest({esIndexUrl: 'http://example.com'});
            var server = nock('http://example.com')
                .put('/')
                .reply(200);

            r.put(function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        // the rest of behavior is tested with get method
    });

    describe('del()', function () {

        it('should call server with DELETE method', function (done) {
            var r = new ESRequest({esIndexUrl: 'http://example.com'});
            var server = nock('http://example.com')
                .delete('/')
                .reply(200);

            r.del(function (err, result) {
                expect(server.isDone()).to.be.true;
                done();
            });
        });

        // the rest of behavior is tested with get method
    });
});


