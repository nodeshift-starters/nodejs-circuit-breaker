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
const cors = require('cors');
const probe = require('kube-probe');
const app = express();
const server = require('http').createServer(app);

// adds basic health-check endpoints
probe(app);

let isOn = true;
const { update, sendMessage } = require('./lib/web-socket')(server, _ => isOn);

// send and receive json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS support
app.use(cors());

// name service API
app.get('/api/name', (request, response) => {
  isOn ? response.send('World') : response.status(500).send('Name service down');
  sendMessage(`${new Date()} ${isOn ? 'OK' : 'FAIL'}`);
});

// current state of service
app.put('/api/state', (request, response) => {
  isOn = request.body.state === 'ok';
  response.send({state: isOn});
  update();
});

app.get('/api/info',
  (request, response) => response.send({ state: isOn ? 'ok' : 'fail' }));

// expose the license.html at http[s]://[host]:[port]/licences/licenses.html
app.use('/licenses', express.static(path.join(__dirname, 'licenses')));

module.exports = server;
