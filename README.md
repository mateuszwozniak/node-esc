# node-esc
node-esc is a small client that helps you interact with ElasticSearch.

## Installation

```sh
$ npm install node-esc
```

## Usage
```javascript

var ESIndex = require('node-esc');
var esi = new ESIndex('http://localhost:9200/twitter');
esi.addType('tweet');

esi.tweet.getById(tweetId, function (err, tweet) {
    console.log(tweet);
});
```

## API
Each type added to ESIndex instance has following methods:
###getByIdRaw(id, callback) - get document by id (http://www.elasticsearch.org/guide/reference/api/get.html) (number or string) and pass raw data retrieved from ElasticSearch.
```javascript
    esi.tweet.getByIdRaw(1, function (err, doc) {
        console.log(doc);
        /**
        logs whole response from ElasticSearch e.g:
            {
                _id: 1,
                _index: 'twitter',
                _type: 'tweet',
                exists: true,
                _source: {
                    _id:0,
                    user: 'foo',
                    message: 'foo bar baz',
                    date: '2012-11-10T12:10:10'
                }
            }
        */
    });
```
###getById(id, callback) - get document by id, but return only document content (_source property from result) or null if document does not exist.
```javascript
    esi.tweet.getById(1, function (err, doc) {
        console.log(doc);
        /**
        logs only _source value e.g:
            {
                _id:0,
                user: 'foo',
                message: 'foo bar baz',
                date: '2012-11-10T12:10:10'
            }
        */
    });
```

###mGetByIdRaw(ids, callback) - get multiple documents by array of ids () and return whole ElasticSearch response
```javascript
    esi.tweet.mGetByIdRaw([1, 2], function (err, docs) {
        console.log(docs);
        /**
        logs whole response from ElasticSearch e.g:
            {
                docs: [
                    {
                        _id: 1,
                        _index: 'twitter',
                        _type: 'tweet',
                        exists: true,
                        _source: {
                            _id:0,
                            user: 'foo',
                            message: 'foo bar baz',
                            date: '2012-11-10T12:10:10'
                        }
                    },
                    {
                        _id: 2,
                        _index: 'twitter',
                        _type: 'tweet',
                        exists: false,
                    }
                ]
            }
        */
    });
```

###mGetByIdRaw(ids, callback) - get multiple documents by array of ids () and return only content of existing documents (as array)
```javascript
    esi.tweet.mGetByIdRaw([1, 2], function (err, docs) {
        console.log(docs);
        /**
        logs whole response from ElasticSearch e.g:
            [
                {
                    _id:0,
                    user: 'foo',
                    message: 'foo bar baz',
                    date: '2012-11-10T12:10:10'
                }
            ]
        */
    });
```

###searchRaw(searchConfig, callback) - execute search in type, with searchConfig passed as request body (http://www.elasticsearch.org/guide/reference/api/search/request-body.html) and return raw ElasticSearch reponse
```javascript
    esi.tweet.searchRaw({query: {term: {message: 'foo'}}}, function (err, results) {
        console.log(results);
        /**
        logs whole response from ElasticSearch e.g:
            {
                _shards: {
                    total: 5,
                    successful: 5,
                    failed: 0
                },
                hits {
                    total: 1,
                    hits: [
                        {
                            _id: 1,
                            _index: 'twitter',
                            _type: 'tweet',
                            exists: true,
                            _source: {
                                _id:0,
                                user: 'foo',
                                message: 'foo bar baz',
                                date: '2012-11-10T12:10:10'
                            }
                        }
                    ]
                }
            }
        */
    });
```

###search(searchConfig, callback) - execute search in type with search config passed as request body and return only content objects of hits array
```javascript
    esi.tweet.search({query: {term: {message: 'foo'}}}, function (err, results) {
        console.log(results);
        /**
        logs whole response from ElasticSearch e.g:
            [
                {
                    _id:0,
                    user: 'foo',
                    message: 'foo bar baz',
                    date: '2012-11-10T12:10:10'
                }
            ]
        */
    });
```
