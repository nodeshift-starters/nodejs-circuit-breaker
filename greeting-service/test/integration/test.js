'use strict';

const test = require('tape');
const request = require('supertest');
const rhoaster = require('rhoaster');

const testEnvironment = rhoaster({
  deploymentName: 'nodejs-circuit-breaker-greeting',
  nodeVersion: '10.x'
});

testEnvironment.deploy()
  .then(runTests)
  .catch(console.error);

function runTests (route) {
  test('/api/greeting', t => {
    t.plan(1);
    request(route)
      .get('/api/greeting')
      .expect(200)
      .then(response => {
        t.ok(response.text.includes('Hello, World!'));
      })
      .then(_ => t.end())
      .catch(t.fail);
  });
}
