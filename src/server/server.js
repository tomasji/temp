/*
 * Main backend app - start HTTP server on PORT
 */
import express from 'express';
const app = express();

app.get('/list/:page', (req, res) => {
  setTimeout(() => {
    const list = [];
    for (let i = 0; i < 50; i++) {
      list.push(parseInt(req.params.page, 10) * 50 + i);
    }
    res.send({pages: 3, list: list});
  }, 5000);
});

app.get('/item/:id', (req, res) => {
  setTimeout(() => {
    res.send({id:req.params.id});
  }, 5000);
});

  // start HTTP server
const portVar = 'PORT';
const listenPort = (process.env[portVar] || 3000);
app.listen(listenPort, () => { console.log('listening on port ', listenPort); });

