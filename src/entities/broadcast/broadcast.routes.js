import express from "express";
import { 
    createSubscriber, 
    getAllSubscribers, 
    getSubscriberById, 
    deleteSubscriber, 
    sendBroadcast, 
    sendBroadcastToAll, 
    getAllBroadcasts,
    getBroadcastById,
    deleteBroadcast,
    unsubscribeSubscriber
} from './broadcast.controller.js';
import { verifyToken, adminMiddleware } from "../../core/middlewares/authMiddleware.js";


const router = express.Router();


// Public routes
router.get('/unsubscribe', unsubscribeSubscriber);
router.post('/subscribe', createSubscriber);

// Protected subscribe routes
router.get('/subscribe', verifyToken, adminMiddleware, getAllSubscribers);
router.get('/subscribe/:id', verifyToken, adminMiddleware, getSubscriberById);
router.delete('/subscribe/:id', verifyToken, adminMiddleware, deleteSubscriber);


//broadcast routes
router.post('/specific', verifyToken, adminMiddleware, sendBroadcast);
router.post('/', verifyToken, adminMiddleware, sendBroadcastToAll);
router.get('/all-subscribers', verifyToken, adminMiddleware, getAllBroadcasts);
router.get('/:id', verifyToken, adminMiddleware, getBroadcastById);
router.delete('/all-subscribers/:id', verifyToken, adminMiddleware, deleteBroadcast);

export default router;
