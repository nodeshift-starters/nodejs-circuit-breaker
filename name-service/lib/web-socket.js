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
const WebSocket = require('ws');

module.exports = (server, state) => {
  const ws = new WebSocket.Server({
    server,
    path: '/name-ws',
    clientTracking: true
  });

  const serviceState = _ => `state:${state()}`;
  ws.on('connection', socket => socket.send(serviceState()));

  const update = _ => ws.clients.forEach(ws => ws.send(serviceState()));
  const sendMessage = msg => ws.clients.forEach(ws => ws.send(msg));

  return {
    update,
    sendMessage
  };
};
