'use strict'

var express = require('express');
var TopicController = require('../controllers/topic');

var router = express.Router();
var md_auth = require('../middleware/authenticated');

router.get('/test', TopicController.test)
router.get('/topics/:page?', TopicController.getTopicPagination)
router.get('/user-topics/:user', TopicController.getTopicsByUsers)
router.get('/topicId/:topicId', TopicController.getTopic)
router.get('/search/:search', TopicController.search)
router.post('/topic', md_auth.authenticated, TopicController.topic)

router.put('/utopic/:id', md_auth.authenticated, TopicController.update)
router.delete('/dtopic/:id', md_auth.authenticated, TopicController.delete)

module.exports = router;

