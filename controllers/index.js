const router = require('koa-router')();

router.use('/user', require('./User').routes());
router.use('/device', require('./Device').routes());
router.use('/auth', require('./Auth').routes());
router.use('/coin', require('./Coin').routes());
router.use('/vending', require('./Vending').routes());
router.use('/owner', require('./Owner').routes());
router.use('/envelope', require('./Envelope').routes());
router.use('/order', require('./Order').routes());
router.use('/statistics', require('./Statistics').routes());
router.use('/message', require('./Message').routes());
router.use('/geo', require('./Geo').routes());
router.use('/monitoring', require('./Monitoring').routes());

module.exports = router;