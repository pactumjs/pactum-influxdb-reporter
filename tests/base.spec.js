const pactum = require('pactum');
const { reporter, mock, request, handler,settings } = pactum;
const ir = require('../src/index');

settings.setLogLevel('DEBUG')

function addReporter() {
  ir.url = 'http://localhost:9393';
  ir.db = 'TestDB';
  ir.measurement = 'ComponentTests';
  ir.tags = {
    Project: 'pactum-influxdb-reporter'
  };
  reporter.add(ir);
}

function mockSetup() {
  handler.addInteractionHandler('get user', () => {
    return {
      request: {
        method: 'GET',
        path: '/api/user'
      },
      response: {
        status: 200
      }
    }
  });
}

before(async () => {
  request.setBaseUrl('http://localhost:9393');
  addReporter();
  mockSetup();
  await mock.start();
});

after(async () => {
  await mock.stop();
});