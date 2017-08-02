/*
 *
 *  Copyright 2016-2017 Red Hat, Inc, and individual contributors.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
'use strict';
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const opossum = require('opossum');
const nameService = require('./lib/name-service-client');

const nameServiceHost = process.env.NAME_SERVICE_HOST || 'http://nodejs-circuit-breaker-name:8080';

const circuitOptions = {
  timeout: 3000, // If name service takes longer than .3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 10000 // After 10 seconds, try again.
}

// Use a circuit breaker for the name service
const circuit = opossum(nameService, circuitOptions);
circuit.fallback(_ => 'Fallback');

// Create the app with an initial websocket endpoint
const app = require('./lib/web-socket')(express(), circuit);

// serve index.html from the file system
app.use(express.static(path.join(__dirname, 'public')));

// send and receive json
app.use(bodyParser.json());

// greeting API
app.get('/api/greeting', (request, response) => {
  circuit.fire(`${nameServiceHost}/api/name`).then(name => {
    response.send({content: `Hello, ${name}`, time: new Date()});
  }).catch(console.error);
});

// circuit breaker state API
app.get('/api/cb-state', (request, response) => {
  response.send({state: circuit.opened ? "open" : "closed"});
});

app.get('/api/name-service-host', (request, response) => {
  response.send({host: nameServiceHost});
});

app.get('/api/health', (request, response) => response.send('OK'));

module.exports = app;