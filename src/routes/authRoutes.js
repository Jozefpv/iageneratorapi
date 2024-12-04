import { Router } from "express";
import { loginUser, logoutUser, registerUser, validateToken } from '../controllers/usersController.js'

const router = Router();

router.post('/register', (req, res) => {
    registerUser(req, res)
});

router.post('/login', (req, res) => {
    loginUser(req, res)
})

router.post('/logout', (req, res) => {
    logoutUser(req, res)
})

router.get('/validate', (req, res) => {
    validateToken(req, res)
})
export default router;