const pactum = require('pactum');
const { reporter, mock } = pactum;
const assert = require('assert');
const ir = require('../src/index');

describe('Reporter', () => {

  before(() => {
    mock.addInteraction({
      id: 'influx',
      request: {
        method: "POST",
        path: "/write",
        queryParams: {
          "db": "TestDB"
        },
        body: "ComponentTests,Method=GET,Path=/api/user,Project=pactum-influxdb-reporter pass=1,fail=0,error=0\nComponentTests,Method=GET,Path=/api/user,Project=pactum-influxdb-reporter pass=0,fail=1,error=0\nComponentTests,Name=ErrorSpec,Method=GET,Path=/api/user,Project=pactum-influxdb-reporter pass=0,fail=0,error=1"
      },
      response: {
        status: 200
      }
    });
  });

  it('run basic spec that passes', async () => {
    await pactum.spec()
      .useInteraction('get user')
      .get('/api/user')
      .expectStatus(200);
  });

  it('run basic spec that fails', async () => {
    try {
      await pactum.spec()
        .__setLogLevel('ERROR')
        .get('/api/user')
        .expectStatus(200);
    } catch {}
  });

  it('run basic spec that throws error', async () => {
    try {
      await pactum.spec()
        .name('ErrorSpec')
        .get('http://localhost:9001/api/user');
    } catch {}
  });

  it('running reporter should contact influx db', async () => {
    await reporter.end();
    assert.strictEqual(mock.getInteraction('influx').exercised, true);
  });

  after(() => {
    mock.clearInteractions();
    ir.reset();
  });

});