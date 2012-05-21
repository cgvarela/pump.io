// client-registration-test.js
//
// Test the client registration API
//
// Copyright 2012, StatusNet Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var assert = require('assert'),
    vows = require('vows'),
    httputil = require('./lib/http');

var ignore = function(err) {};

var suite = vows.describe('client registration API');

suite.addBatch({
    'When we set up the app': {
        topic: function() {
            var cb = this.callback,
                config = {port: 4815,
                          hostname: 'localhost',
                          driver: 'memory',
                          params: {},
                          nologger: true
                         },
                makeApp = require('../lib/app').makeApp;

            makeApp(config, function(err, app) {
                if (err) {
                    cb(err, null);
                } else {
                    app.run(function(err) {
                        if (err) {
                            cb(err, null);
                        } else {
                            cb(null, app);
                        }
                    });
                }
            });
        },
        teardown: function(app) {
            app.close();
        },
        'it works': function(err, app) {
            assert.ifError(err);
        },
        'and we check the client registration endpoint': {
            topic: function() {
                httputil.options('localhost', 4815, '/api/client/register', this.callback);
            },
            'it exists': function(err, allow, res, body) {
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
            },
            'it supports POST': function(err, allow, res, body) {
                assert.include(allow, 'POST');
            },
            'and we register with no type': {
                topic: function() {
                    httputil.post('localhost',
                                  4815,
                                  '/api/client/register',
                                  {application_name: "Typeless"},
                                  this.callback);
                },
                'it fails correctly': function(err, res, body) {
                    assert.ifError(err);
                    assert.equal(res.statusCode, 400);
                }
            },
            'and we register with an unknown type': {
                topic: function() {
                    httputil.post('localhost',
                                  4815,
                                  '/api/client/register',
                                  {application_name: "Frobnicator",
                                   type: 'client_frobnicate'
                                  },
                                  this.callback);
                },
                'it fails correctly': function(err, res, body) {
                    assert.ifError(err);
                    assert.equal(res.statusCode, 400);
                }
            },
            'and we register to associate with a client ID already set': {
                topic: function() {
                    httputil.post('localhost',
                                  4815,
                                  '/api/client/register',
                                  {application_name: "Jump The Gun",
                                   type: 'client_associate',
                                   client_id: "I MADE IT MYSELF"
                                  },
                                  this.callback);
                },
                'it fails correctly': function(err, res, body) {
                    assert.ifError(err);
                    assert.equal(res.statusCode, 400);
                }
            },
            'and we register to associate with a client secret set': {
                topic: function() {
                    httputil.post('localhost',
                                  4815,
                                  '/api/client/register',
                                  {application_name: "Psst",
                                   type: 'client_associate',
                                   client_secret: "I hate corn."
                                  },
                                  this.callback);
                },
                'it fails correctly': function(err, res, body) {
                    assert.ifError(err);
                    assert.equal(res.statusCode, 400);
                }
            }
        }
    }
});

suite.export(module);