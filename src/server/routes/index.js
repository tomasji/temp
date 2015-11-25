const express = require('express');
const router = new express.Router();
module.exports = router;

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
router.get('/', (req, res) => { res.render('ww-test', {page: 'test_suite', vars: vars}); });
