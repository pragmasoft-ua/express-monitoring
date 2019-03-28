const express = require('express');
const mysql = require('mysql2/promise');
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

app.get('/', async (req, res) => {

    let conn;
    try {
        conn = await mysql.createConnection(config);
        let [rows] = await conn.query(queryStr);
        let message = 'OK\n';
        console.debug(rows[0]['1']);
        res.send(message);
    } catch (err) {
        console.error('MySQL error', err);
        res.status(503).send(err.message || 'Service Unavailable\n');
    } finally {
        if (conn) await conn.end();
    }

});

app.get('/gc', (req, res) => {
    global.gc();
    let message = 'GC\n';
    console.debug(message);
    res.send(message);
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