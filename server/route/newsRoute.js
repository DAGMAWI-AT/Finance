const express = require('express');
const router = express.Router();
const newsController = require('../controller/webContent/news');
const verifyToken = require("../middleware/authMiddleware");

// News routes
router.post('/create', verifyToken, 
  newsController.upload.single("image"), 
  newsController.createNews
);

router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);
router.put('/:id', verifyToken, 
  newsController.upload.single("image"), 
  newsController.updateNews
);
router.delete('/:id', newsController.deleteNews);

// Comment routes
router.post('/:newsId/comments', newsController.createComment);
router.post('/news/:newsId/comments', verifyToken, newsController.createAdminComment);

router.get('/:newsId/comments', newsController.getComments);
router.put('/comments/:commentId', newsController.updateComment);
router.delete('/comments/:commentId', newsController.deleteComment);

module.exports = router;