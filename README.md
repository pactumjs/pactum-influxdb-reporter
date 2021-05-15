# pactum-influxdb-reporter

InfluxDB reporter for pactum tests

## Installation

```shell
npm install --save-dev pactum
npm install --save-dev pactum-influxdb-reporter
```

## Usage

```js
const pir = require('pactum-influxdb-reporter');
const pactum = require('pactum');
const reporter = pactum.reporter;

// global before block
before(() => {
  pir.url = '<influxdb url>';
  pir.db = '<db name>';
  pir.measurement = '<measurement name>';

  /* custom tags like - build version */
  pir.tags = { Version: '1.0.12' }; // optional
  
  reporter.add(pir);
});

// global after block
after(() => {
  return reporter.end();
});
```