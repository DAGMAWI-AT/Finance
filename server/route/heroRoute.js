const express = require("express");
const router = express.Router();
const heroController = require("../controller/webContent/hero");

router.get("/", heroController.getSlides);
router.get("/:id", heroController.getSlideById); // 👈 Add this before other `/:id` routes
router.post("/", heroController.upload.single("image"), heroController.createSlide);
router.put("/:id", heroController.upload.single("image"), heroController.updateSlide);
router.delete("/:id", heroController.deleteSlide);

module.exports = router;
