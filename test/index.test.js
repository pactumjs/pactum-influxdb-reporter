const test = require('uvu').test;
const assert = require('uvu/assert');
const pactum = require('pactum');
const { reporter, mock, request, handler } = pactum;

const ir = require('../src/index');

// mock server setup
test.before(() => {
  handler.addMockInteractionHandler('get user', () => {
    return {
      withRequest: {
        method: 'GET',
        path: '/api/user'
      },
      willRespondWith: {
        status: 200
      }
    }
  });
  mock.addMockInteraction({
    id: 'influx',
    withRequest: {
      "method": "POST",
      "path": "/write",
      "query": {
        "db": "TestDB"
      },
      "body": "ComponentTests,Method=GET,Path=http://localhost:9393/api/user,Project=pactum-influxdb-reporter pass=1,fail=0,error=0\nComponentTests,Method=GET,Path=http://localhost:9393/api/user,Project=pactum-influxdb-reporter pass=0,fail=1,error=0\nComponentTests,Name=ErrorSpec,Method=GET,Path=http://localhost:9001/api/user,Project=pactum-influxdb-reporter pass=0,fail=0,error=1"
    },
    willRespondWith: {
      status: 200
    }
  })
  return mock.start();
});

// influx db reporter setup
test.before(() => {
  ir.url = 'http://localhost:9393';
  ir.db = 'TestDB';
  ir.measurement = 'ComponentTests';
  ir.tags = {
    Project: 'pactum-influxdb-reporter'
  };
  reporter.add(ir);
});

// request setup
test.before(() => {
  request.setBaseUrl('http://localhost:9393');
});

test.after(() => {
  return mock.stop();
});

test('spec passed', async () => {
  await pactum.spec()
    .useMockInteraction('get user')
    .get('/api/user')
    .expectStatus(200);
});

test('spec failed', async () => {
  try {
    await pactum.spec()
      .get('/api/user')
      .expectStatus(200);
  } catch (error) {
    console.log(error);
  }
});

test('spec error', async () => {
  try {
    await pactum.spec()
      .name('ErrorSpec')
      .get('http://localhost:9001/api/user')
      .expectStatus(200);
  } catch (error) {
    console.log(error);
  }
});

test('run reporter', async () => {
  await reporter.end();
  assert.equal(mock.getInteraction('influx').exercised, true);
});

test('spec passed - enable false', async () => {
  ir.reset();
  ir.enable = false;
  await pactum.spec()
    .useMockInteraction('get user')
    .get('/api/user')
    .expectStatus(200);
  await reporter.end();
});

test.run();