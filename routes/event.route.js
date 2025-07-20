import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { createEvent, getEvents, deleteEvent, updateEvent, registerEvent } from '../controllers/event.controller.js';


const router = express.Router();

router.post('/create', verifyToken, createEvent)
router.post('/register', verifyToken, registerEvent)
router.get('/getevents', getEvents);
router.delete('/deletepost/:postId/:userId', verifyToken, deleteEvent);
router.put('/updatepost/:postId/:userId', verifyToken, updateEvent);

export default router;