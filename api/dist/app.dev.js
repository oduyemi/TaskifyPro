"use strict";

var app = require('express')();

var _require = require('uuid'),
    v4 = _require.v4;

app.get('/api', function (req, res) {
  var path = "/api/item/".concat(v4());
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end("Hello! Go to item: <a href=\"".concat(path, "\">").concat(path, "</a>"));
});
app.get('/api/item/:slug', function (req, res) {
  var slug = req.params.slug;
  res.end("Item: ".concat(slug));
});
module.exports = app;