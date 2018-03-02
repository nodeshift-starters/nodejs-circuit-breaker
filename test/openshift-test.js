'use strict';

import {serial as test} from 'ava';
const OpenshiftTestAssistant = require('openshift-test-assistant');
const path = require('path');

/************************************************* deployment configs *************************************/

const testGreetingAssistant = new OpenshiftTestAssistant({
  'projectLocation': path.join(__dirname, '/../greeting-service'),
  'strictSSL': false
});

const testNameAssistant = new OpenshiftTestAssistant({
  'projectLocation': path.join(__dirname, '/../name-service'),
  'strictSSL': false
});
// when waiting for name service to be ready, do not check just base URL (because it not used on name service)
// but check on http://****/api/name
testNameAssistant.readinessPath = '/api/name';


/*************************************************** TESTS ************************************************/

test.before('setup', async () => {
  const nameDeploy = testNameAssistant.deploy();
  const greetingDeploy = testGreetingAssistant.deploy();

  await nameDeploy;
  await greetingDeploy;
  await testGreetingAssistant.waitFor(circuitBreakerIsClosed).catch(() => {
    throw new Error('The circuit breaker did not close after deployment');
  });
});

/**
 * After each test, turn the name service on
 */
test.afterEach.always('turn on name service', async () => {
  await nameServiceOn();
  await testGreetingAssistant.waitFor(circuitBreakerIsClosed);
});

/**
 * Test that in normal operation the greeting service return 'Hello, world' and the circuit breaker is closed
 */
test('basic function', async (t) => {
  t.plan(2);
  let response = await testGreetingAssistant.createRequest()
    .get('/api/greeting')
    .expect('Content-Type', /json/)
    .expect(200);
  t.is(response.body.content, 'Hello, World');

  // check status of circuit breaker
  response = await testGreetingAssistant.createRequest()
    .get('/api/cb-state')
    .expect('Content-Type', /json/)
    .expect(200);
  t.is(response.body.state, 'closed');
});

/**
 * Turn off the name service and wait for proper reaction
 */
test('circuit breaking', async (t) => {
  t.plan(4);
  // shut down the name service
  let response = await nameServiceOff();
  t.is(response.body.state, false);

  // wait for greeting service to notice the failure
  // if the greeting service will not change to fallback state, test will fail on timeout
  await testGreetingAssistant.waitFor(circuitBreakerIsOpen).catch((err) => {
    throw new Error('The circuit breaker did not open after turning the name service off. Reason: ' + err.message);
  });

  // check fallback response
  response = await testGreetingAssistant.createRequest()
    .get('/api/greeting')
    .expect('Content-Type', /json/)
    .expect(200);
  t.is(response.body.content, 'Hello, Fallback');

  // turn on the name service
  response = await nameServiceOn();
  t.is(response.body.state, true);

  // wait for greeting service to notice that name service is on again
  await testGreetingAssistant.waitFor(circuitBreakerIsClosed).catch((err) => {
    throw new Error('The circuit breaker did not close after turning the name service on. Reason: ' + err.message);
  });

  // check normal response after the circuit breaker is closed
  response = await testGreetingAssistant.createRequest()
    .get('/api/greeting')
    .expect('Content-Type', /json/)
    .expect(200);
  t.is(response.body.content, 'Hello, World');
});

test.after.always('teardown', async () => {
  const greetingUndeploy = testGreetingAssistant.undeploy();
  const nameUndeploy = testNameAssistant.undeploy();
  await greetingUndeploy;
  await nameUndeploy;
});


/******************************************** functions ********************************************/

/**
  wait for circuit breaker to open
 @returns {boolean} true when circuit breaker is open, false otherwise
 */
async function circuitBreakerIsOpen () {
  // force greeting service to connect to the name service
  // so it should found out that the name service is down
  await testGreetingAssistant.createRequest()
    .get('/api/greeting');

  const response = await testGreetingAssistant.createRequest()
    .get('/api/cb-state')
    .expect(200);
  return response.body.state === 'open';
}

/**
 wait for circuit breaker to close
 @returns {boolean} true when circuit breaker is closed, false otherwise
 */
async function circuitBreakerIsClosed () {
  // there is no need to send request to the /api/greeting,
  // the greeting service should periodically check if the name service is still off
  const response = await testGreetingAssistant.createRequest()
    .get('/api/cb-state')
    .expect(200);
  return response.body.state === 'closed';
}

/**
 * Turn the name service on
 * @returns {Promise<response>}
 */
function nameServiceOn() {
  return testNameAssistant.createRequest()
    .put('/api/state')
    .send({
      "state": "ok"
    })
    .expect(200);
}

/**
 * Turn the name service off
 * @returns {Promise<response>}
 */
function nameServiceOff() {
  return testNameAssistant.createRequest()
    .put('/api/state')
    .send({
      "state": "fail"
    })
    .expect(200);
}
