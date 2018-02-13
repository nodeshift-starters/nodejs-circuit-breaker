'use strict';

const test = require('ava');
const OpenshiftTestAssistant = require('openshift-test-assistant');
const path = require('path');

const testGreetingAssistant = new OpenshiftTestAssistant({
  'projectLocation': path.join(__dirname, '/../greeting-service'),
  'strictSSL': false
});

const testNameAssistant = new OpenshiftTestAssistant({
  'projectLocation': path.join(__dirname, '/../name-service'),
  'strictSSL': false
});

// TODO: FIX
test.before('setup', async () => {
  // this is the problematic part
  process.chdir(path.join(__dirname, '/../greeting-service/'));
  await testGreetingAssistant.deploy();
  process.chdir(path.join(__dirname, '/../name-service/'));
  await testNameAssistant.deploy();
});

// TODO: create test
test('circuit breaking', async (t) => {
  const response = await testGreetingAssistant.createRequest()
    .get('/api/greeting')
    .expect('Content-Type', /json/)
    .expect(200);
  t.is(response.body.content, 'Hello, World');
});

test.after.always('teardown', async () => {
  const greetingPromise = testGreetingAssistant.undeploy();
  const namePromise = testNameAssistant.undeploy();
  await greetingPromise;
  await namePromise;
});

