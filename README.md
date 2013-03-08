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
###query(urlParam, respBody, callback)
call index with urlParam added to url and respBody passed as responseBody, and pass ElasicSearch response to callback.
With this method you are able to do any operation on type.
```javascript
    // search for tweets by user
    esi.tweet.query('_search', {query: {term: {user: 'foobar'}}}, function (err, resp) {
        console.log(resp);
        /**
        logs
        {
            timed_out : false,
            hits : {
                max_score : 0.30685282,
                total : 2,
                hits : [
                {
                    _index : "twitter",
                    _id : "1",
                    _score : 0.30685282,
                    _type : "tweet",
                    _source : {
                        message : "lorem ipsum",
                        user : "foo"
                    }
                },
                {
                    _index : "twitter",
                    _id : "3",
                    _score : 0.30685282,
                    _type : "tweet",
                    _source : {
                        message : "bar baz qux",
                        user : "foo"
                        }
                    }
                ]
            },
            took : 10,
            _shards : {
                failed : 0,
                successful : 5,
                total : 5
            }
        }

        */
    });
```

###index(id, data, callback)
add (or update) document to index (http://www.elasticsearch.org/guide/reference/api/index_.html)
When first parameter (id) is absent then _id from data will be used
```javascript
    esi.tweet.index(1, {user: 'foo', message: 'lorem ipsum'}, function (err, resp) {
        console.log(resp);
        /**
        logs response from ElasticSearch:
        {
            ok : true,
            _index : "twitter",
            _id : "1",
            _version : 1,
            _type : "tweet"
        }
       */
   });
```

###delete(id/doc, callback)
delete document (http://www.elasticsearch.org/guide/reference/api/delete.html) with passed id (when first param is object then use _id as document identifier)
```javascript
    esi.tweet.delete(1, function (err, resp) {
        console.log(resp);
        /**
        logs response from ElasticSearch:
        {
             ok : true,
             _index : "twitter",
             _id : "1",
             _version : 2,
             _type : "tweet",
             found : true
        }
       */
   });
```

###update(id, configObject, callback)
update document with passed id. Send configObject as response body (http://www.elasticsearch.org/guide/reference/api/update.html)
```javascript
    esi.tweet.update(1, {doc: {message: 'new message content'}}, function (err, resp) {
        console.log(resp);
        /**
        logs response from ElasticSearch:
        {
            ok : true,
            _index : "twitter",
            _id : "1",
            _version : 2,
            _type : "tweet"
        }
       */
   });
```

###getById(id, callback)
get document by id (http://www.elasticsearch.org/guide/reference/api/get.html) (number or string) and pass response from ElasticSearch to callback.
```javascript
    esi.tweet.getById(1, function (err, doc) {
        console.log(doc);
        /**
        logs response from ElasticSearch e.g:
            {
                _id: 1,
                _index: "twitter",
                _type: "tweet",
                exists: true,
                _source: {
                    _id:0,
                    user: "foo",
                    message: "foo bar baz",
                    date: "2012-11-10T12:10:10"
                }
            }
        */
    });
```

###mGetById(ids, callback)
get multiple documents by array of ids () and pass response from ElasticSearch to callback.
```javascript
    esi.tweet.mGetById([1, 2], function (err, docs) {
        console.log(docs);
        /**
        logs response from ElasticSearch e.g:
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

###search(searchConfig, callback)
execute search in type, with searchConfig passed as request body (http://www.elasticsearch.org/guide/reference/api/search/request-body.html) and pass ElasticSearch reponse to callback.
```javascript
    esi.tweet.search({query: {term: {message: 'foo'}}}, function (err, results) {
        console.log(results);
        /**
        logs response from ElasticSearch e.g:
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

