const influx = require('influxdb-v1');

const specs = [];
const steps = [];
const tests = [];

const ir = {

  name: 'InfluxDBReporter',
  db: 'APITests',
  measurement: 'ComponentTests',
  tags: {},

  afterSpec(spec) {
    specs.push(spec);
  },

  afterStep(step) {
    steps.push(step);
  },

  afterTest(test) {
    tests.push(test);
  },

  end() {
    const db = influx.db({ url: '', db: ''});
    const metrics = [];
    for (let i = 0; i < specs.length; i++) {
      const metric = {
        tags: {},
        fields: {},
        measurement: this.measurement
      };
      const spec = specs[i];
      metric.tags['name'] = spec.info.name;
      metric.tags['method'] = spec.request.method;
      metric.tags['path'] = spec.request.path;
      Object.assign(metric.tags, this.tags);
      metric.fields['pass'] = spec.info.status === 'PASSED' ? 1 : 0;
      metric.fields['fail'] = spec.info.status === 'FAILED' ? 1 : 0;
      metric.fields['error'] = spec.info.status === 'ERROR' ? 1 : 0;
      metrics.push(metric);
    }
    return db.write(metrics);
  },

  reset() {
    tests.length = 0;
    steps.length = 0;
    specs.length = 0;
  }

}

module.exports = ir;