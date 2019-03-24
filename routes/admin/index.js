const express = require('express'),
  router = express.Router();

router.all('*', (req, res, next) => {
  res.app.locals.layout = 'admin/index';
  next();
});
router.get('/', (req, res) => {
  res.render('admin/index');
});

module.exports = router;
