const express = require('express');
const router = express.Router();

const contactController = require('../controller/webContent/contact');

router.post('/create', contactController.createContactMessage);
router.put('/contentInfo', contactController.saveContact );

router.get('/contact', contactController.getContact);


module.exports = router;