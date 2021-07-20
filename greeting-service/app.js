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
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const Opossum = require('opossum');
const nameService = require('./lib/name-service-client');

const app = express();
const server = http.createServer(app);

// Add basic health check endpoints
app.use('/ready', (request, response) => {
  return response.sendStatus(200);
});

app.use('/live', (request, response) => {
  return response.sendStatus(200);
});

const nameServiceHost = process.env.NAME_SERVICE_HOST || 'http://nodejs-circuit-breaker-name:8080';

const circuitOptions = {
  timeout: 3000, // If name service takes longer than .3 seconds, trigger a failure
  errorThresholdPercentage: 50, // When 50% of requests fail, trip the circuit
  resetTimeout: 10000 // After 10 seconds, try again.
};

// Use a circuit breaker for the name service
const circuit = new Opossum(nameService, circuitOptions);
circuit.fallback(_ => 'Fallback');

// Create the app with an initial websocket endpoint
require('./lib/web-socket')(server, circuit);

// Serve index.html from the file system
app.use(express.static(path.join(__dirname, 'public')));
// Expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

// Send and receive json
app.use(bodyParser.json());

// Greeting API
app.get('/api/greeting', (request, response) => {
  circuit.fire(`${nameServiceHost}/api/name`).then(name => {
    response.send({ content: `Hello, ${name}`, time: new Date() });
  }).catch(console.error);
});

// Circuit breaker state API
app.get('/api/cb-state', (request, response) => {
  response.send({ state: circuit.opened ? 'open' : 'closed' });
});

app.get('/api/name-service-host', (request, response) => {
  response.send({ host: nameServiceHost });
});

module.exports = server;
