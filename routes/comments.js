'use strict'

var express = require('express');
var CommentController = require('../controllers/comments');

var router = express.Router();
var md_auth = require('../middleware/authenticated');


router.post('/comment/topic/:id',md_auth.authenticated, CommentController.add)
router.put('/comment/:idcomment', md_auth.authenticated, CommentController.update)
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete)


module.exports = router;
