const express = require('express');
const router = express.Router();
const aboutController = require('../controller/webContent/about');

router.get('/', aboutController.getAbout);
router.post('/', aboutController.createAbout);
router.put('/:id', aboutController.updateAbout);
router.delete('/:id', aboutController.deleteAbout);

module.exports = router;
