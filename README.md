# pactum-influxdb-reporter

InfluxDB reporter for pactum tests

## Installation

```shell
npm install --save-dev pactum
npm install --save-dev pactum-influxdb-reporter
```

## Usage

```javascript
const pir = require('pactum-influxdb-reporter');
const pactum = require('pactum');
const reporter = pactum.reporter;

// global before block
before(() => {
  pir.url = '<influxdb url>';
  pir.db = '<db name>';
  pir.measurement = '<measurement name>';
  pir.tags = { /* custom tags like - build version */ };
  reporter.add(pir);
});

// global after block
after(() => {
  return reporter.end();
});
```