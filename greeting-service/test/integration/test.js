/* eslint-disable no-undef */
'use strict';

const assert = require('assert');
const supertest = require('supertest');
const rhoaster = require('rhoaster');

const testEnvironment = rhoaster({
  deploymentName: 'nodejs-circuit-breaker-greeting',
  dockerImage: 'registry.access.redhat.com/ubi8/nodejs-12'
});

describe('Greeting route', () => {
  let route;
  before(async function () {
    this.timeout(0);
    route = await testEnvironment.deploy();
  });

  it('/api/greeting', async () => {
    const response = await supertest(route)
      .get('/api/greeting')
      .expect(200);

    assert.strictEqual(response.text.includes, 'Hello, World!');
  });

  after(async function () {
    this.timeout(0);
    await testEnvironment.undeploy();
  });
});
