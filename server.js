const express = require('express');
const mysql = require('mysql');
const Prometheus = require('prom-client');

const app = express();

const config = {
    host: '104.155.17.242',
    port: 3306,
    user: 'abler',
    password: 'abler',
    database: 'abler',
    connectionLimit: 5,
};

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send(err.message || 'Internal Server Error');
});

const queryStr = 'select 1';

app.get('/', (req, res) => {

    const conn = mysql.createConnection(config);

    conn.query(queryStr, (err, results) => {
        try {
            if (err) {
                console.error('MySQL error', err);
                res.status(503).send(err.message || 'Service Unavailable\n');
            } else {
                let message = 'OK\n';
                console.debug(message);
                res.send(message);
            }

        } finally {
            conn.end();
        }
    });

});

const register = Prometheus.register;

app.get('/metrics', (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(register.metrics())
})

Prometheus.collectDefaultMetrics();

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});