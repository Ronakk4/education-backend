const express = require('express');
const router = express.Router();
const { getUsers,getUserbyID ,uploadProfileImage, registerUser,updateUserProfile,loginUser} = require('../controllers/user');
const{authenticateToken}=require('../middleware/authorization')




router.get('/users', getUsers);
router.get('/users/:id',getUserbyID)
router.post('/upload',uploadProfileImage)
router.post('/register',registerUser)
router.put('/update',authenticateToken,updateUserProfile)
router.post('/login', loginUser)

module.exports = router;
