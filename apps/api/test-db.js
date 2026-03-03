const { Client } = require('pg');

const client = new Client({
    user: 'peyker_user',
    host: '127.0.0.1',
    database: 'peyker_db',
    password: 'peyker_password',
    port: 2345,
});

client.connect()
    .then(() => {
        console.log('Connected successfully');
        return client.query('SELECT NOW()');
    })
    .then(res => {
        console.log('Time:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error', err);
    });
