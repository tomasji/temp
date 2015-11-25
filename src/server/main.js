const express = require('express');
const routes = require('./routes');
const app = express();



app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 3000));

// app.get('/', function(req, res) { res.send('Hello'); };);

app.disable('etag');
app.use('/', routes);
app.use('/js', express.static('client'));
app.use('/img', express.static('img', {etag: true}));
app.use('/css', express.static('css', {etag: true}));

app.listen(app.get('port'), () => {
    /*eslint-disable no-console*/
    console.log('listening on port ', app.get('port'));
});
