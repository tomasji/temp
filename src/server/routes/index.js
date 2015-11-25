const express = require('express');
const router = new express.Router();
module.exports = router;

    // Main page
router.get('/', (req, res) => { res.render('ww-test', {page: 'test_suite'}); });
