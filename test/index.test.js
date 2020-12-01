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
    withRequest: {
      "method": "POST",
      "path": "/write",
      "query": {
        "db": "TestDB"
      },
      "body": "ComponentTests,name=NA,method=GET,path=http://localhost:9393/api/user,Project=pactum-influxdb-reporter pass=1,fail=0,error=0\nComponentTests,name=NA,method=GET,path=http://localhost:9393/api/user,Project=pactum-influxdb-reporter pass=0,fail=1,error=0\nComponentTests,name=NA,method=GET,path=http://localhost:9001/api/user,Project=pactum-influxdb-reporter pass=0,fail=0,error=1"
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
      .get('http://localhost:9001/api/user')
      .expectStatus(200);
  } catch (error) {
    console.log(error);
  }
});

test('run reporter', async () => {
  await reporter.end();
});

test('validate influx db reporter', async () => {

});

test.run();