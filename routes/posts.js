var express = require('express');
var PostsController = require('../controllers/posts');
var router = express.Router();
var checkAuth = require('../utils/auth');

router.get('/', PostsController.getPosts);
router.get('/page/:num', PostsController.getPosts);
router.get('/search/:searchTerm', PostsController.getPosts);
router.get('/search/:searchTerm/page/:num', PostsController.getPosts);
router.get('/archive', PostsController.getArchive);
router.get('/archive/:year/:month', PostsController.getPosts);
router.get('/archive/:year/:month/page/:num', PostsController.getPosts);
router.get('/:id', PostsController.getPostById);
router.get('/view/:slug', PostsController.getPostBySlug);

router.post('/', checkAuth, PostsController.addPost);
router.post('/slug', checkAuth, PostsController.checkSlug);
router.post('/comments/:post', PostsController.addComment);

router.put('/:id', checkAuth, PostsController.updatePost);

router.delete('/:id', checkAuth, PostsController.deletePost);

module.exports = router;