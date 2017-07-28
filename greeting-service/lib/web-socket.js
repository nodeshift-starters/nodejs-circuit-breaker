'use strict';

const expressWs = require('express-ws');

module.exports = exports = (app, circuit) => {
  const wsInstance = expressWs(app);
  const circuitState = _ => `isOpen:${circuit.opened}`;
  const update = _ => wsInstance.getWss().clients.forEach(ws => ws.send(circuitState()));

  app.ws('/cb-ws', (ws, req) => {
    ws.send(circuitState());
  });

  circuit.on('open', update);
  circuit.on('halfOpen', update);
  circuit.on('close', update);
  return app;
}

