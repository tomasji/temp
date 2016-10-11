/*
 * Main backend app - start HTTP server on PORT
 */
import express from 'express';
const app = express();

app.get('/v2/shops/:shopId/listings/draft', (req, res) => {
  console.log('Got shop request', req.params.shopId);
  setTimeout(() => {
    const list = [];
    for (let i = 0; i < 10; i++) {
      list.push({ listing_id: (parseInt(req.query.page, 10) - 1) * 10 + i });
    }
    let next_page = (req.query.page == '2') ? null : 2;
    console.log(req.query);

    res.send({pagination: {next_page: next_page}, results: list});
  }, 5000);
});

app.get('/v2/listings/:id', (req, res) => {
  console.log('Got listing request', req.params.id);
  if (req.params.id == 2) {
    return res.status(500).send('Something broke!');
  }
  setTimeout(() => {
    res.send({results:[
      {
        listing_id: req.params.id,
        title: 'title ' + req.params.id
      }
    ]});
  }, 5000);
});

  // start HTTP server
const portVar = 'PORT';
const listenPort = (process.env[portVar] || 3000);
app.listen(listenPort, () => { console.log('listening on port ', listenPort); });

