/* eslint-disable no-undef */
'use strict';

const assert = require('assert');
const supertest = require('supertest');
const rhoaster = require('rhoaster');

const testEnvironment = rhoaster({
  deploymentName: 'nodejs-circuit-breaker-name',
  dockerImage: 'registry.access.redhat.com/ubi8/nodejs-12'
});

describe('Name service route', () => {
  let route;
  before(async function () {
    this.timeout(0);
    route = await testEnvironment.deploy();
  });

  it('/api/info', async () => {
    const response = await supertest(route)
      .get('/api/info')
      .expect(200);

    assert.strictEqual(JSON.parse(response.text).state, 'ok');
  });

  it('/api/name', async () => {
    const response = await supertest(route)
      .get('/api/name')
      .expect(200);

    assert.strictEqual(response.text, 'World!');
  });

  after(async function () {
    this.timeout(0);
    await testEnvironment.undeploy();
  });
});
