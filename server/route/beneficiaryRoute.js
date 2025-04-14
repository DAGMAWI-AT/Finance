const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controller/beneficiaryController');
const verifyToken = require("../middleware/authMiddleware");

// Create a new beneficiary with file uploads
router.post('/beneficiaries', beneficiaryController.uploadFiles, beneficiaryController.createBeneficiary);

// Other routes
router.get('/beneficiaries', beneficiaryController.getAllBeneficiaries);
router.get('/beneficiaries/:id', beneficiaryController.getBeneficiaryById);
router.put('/beneficiaries/:id', beneficiaryController.uploadFiles, beneficiaryController.updateBeneficiary);
router.delete('/beneficiaries/:id', beneficiaryController.deleteBeneficiary);

module.exports = router;