const express = require('express');
const router = new express.Router();
const pg = require('pg');
module.exports = router;

const connectionString = process.env.DATABASE_URL || 'postgres://usr:usr_password@test_db00:5432/test';

//--------------------------------------------------------------------------------
function getData(sql, params, callback) {
    pg.connect(connectionString, (connectErr, client, done) => {
        if (connectErr) {
            /*eslint-disable no-console*/
            return console.error('error fetching client from pool', connectErr);
            /*eslint-enable no-console*/
        }
        client.query(sql, params, (err, result) => {
            done();
            if (err) {
                /*eslint-disable no-console*/
                console.error('Error running query: ', err, '\n' + sql, ' [', params, ']');
                /*eslint-enable no-console*/
                return callback('Error running query ' + sql + ' ' + err);
            }
            callback(result.rows);
        });
    });
}

function escapeHTML(s) {
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
    // Main page
let vars = '';
const env = process.env;
const names = Object.keys(env).sort();
for (const v of names) {
    vars += escapeHTML(v) + '=' + escapeHTML(process.env[v]) + '<br/>';
}

getData('SELECT name FROM test ORDER BY name', [], (dbData) => {
    router.get('/', (req, res) => { res.render('ww-test', {page: 'test_suite', vars: vars, db_data: dbData}); });
});
