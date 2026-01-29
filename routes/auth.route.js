import express from "express"
import { getProfile, loginUser, logout, registerUser, updateCoverPhoto, updateIntro, updateProfilePhoto } from "../controllers/auth.controller.js"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { upload } from "../middleware/multer.js"

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/logout', logout)
router.get('/profile/:id', getProfile)
router.put('/update/profile-pic', isAuthenticated, upload.single('file'), updateProfilePhoto)
router.put('/update/cover-pic', isAuthenticated, upload.single('file'), updateCoverPhoto)
router.put('/update-intro', isAuthenticated, updateIntro)

export default router