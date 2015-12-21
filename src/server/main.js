const express = require('express');
const app = express();


app.set('view engine', 'ejs');
app.set('port', (process.env.PORT || 3000));

app.disable('etag');
app.get('/', (req, res) => { res.render('test'); });

app.listen(app.get('port'), () => {
    /*eslint-disable no-console*/
    console.log('listening on port ', app.get('port'));
});
