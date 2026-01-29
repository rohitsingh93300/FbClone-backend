import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { upload } from "../middleware/multer.js"
import { createPost, deletePost, dislikePost, getAllPost, getPostByUserId, getUserPost, likePost, updatePost } from "../controllers/post.controller.js"

const router = express.Router()


router.post('/create', isAuthenticated, upload.single('file'), createPost)
router.get('/getallpost', getAllPost)
router.get('/getuserpost', getUserPost)
router.get('/:userId', getPostByUserId)
router.delete('/delete/:id', isAuthenticated, deletePost)
router.put('/update-post/:postId', upload.single('file'), updatePost)
router.get('/:id/like', isAuthenticated, likePost)
router.get('/:id/dislike', isAuthenticated, dislikePost)


export default router