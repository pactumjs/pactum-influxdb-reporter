const influx = require('influxdb-v1');

const specs = [];
const steps = [];
const tests = [];

const ir = {

  name: 'InfluxDBReporter',
  url: '',
  db: '',
  measurement: '',
  tags: {},
  enable: true,

  afterSpec(spec) {
    if (this.enable) {
      specs.push(spec);
    }
  },

  afterStep(step) {
    if (this.enable) {
      steps.push(step);
    }
  },

  afterTest(test) {
    if (this.enable) {
      tests.push(test);
    }
  },

  end() {
    if (this.enable) {
      const db = influx.db({ url: this.url, db: this.db});
      const metrics = [];
      for (let i = 0; i < specs.length; i++) {
        const metric = {
          tags: {},
          fields: {},
          measurement: this.measurement
        };
        const spec = specs[i];
        if (spec.info.name) {
          metric.tags['Name'] = spec.info.name;
        }
        metric.tags['Method'] = spec.request.method;
        metric.tags['Path'] = spec.request.path;
        Object.assign(metric.tags, this.tags);
        metric.fields['pass'] = spec.info.status === 'PASSED' ? 1 : 0;
        metric.fields['fail'] = spec.info.status === 'FAILED' ? 1 : 0;
        metric.fields['error'] = spec.info.status === 'ERROR' ? 1 : 0;
        metrics.push(metric);
      }
      if (metrics.length > 0) {
        return db.write(metrics);
      }
    }
  },

  reset() {
    tests.length = 0;
    steps.length = 0;
    specs.length = 0;
  }

}

module.exports = ir;