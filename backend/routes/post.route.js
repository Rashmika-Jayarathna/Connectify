import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createPost, deletePost, commentOnPost, likeUnlikePost ,getAllPosta, getLikedPosts,getFollowingPosts, getUserPosts} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create',protectRoute, createPost);
router.delete('/:id',protectRoute, deletePost);
router.post('/like/:id',protectRoute, likeUnlikePost);
router.post('/comment/:id',protectRoute, commentOnPost);

router.get('/all',protectRoute, getAllPosta);
router.get('/following',protectRoute, getFollowingPosts);
router.get('/likes/:id',protectRoute, getLikedPosts);
router.get('/user/:username',protectRoute, getUserPosts);

export default router;