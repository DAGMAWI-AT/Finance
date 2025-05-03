const express = require('express');
const {
  getServices,
  createService,
  updateService,
  deleteService,
} = require('../controller/webContent/service');

const router = express.Router();

router.get('/', getServices);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;
