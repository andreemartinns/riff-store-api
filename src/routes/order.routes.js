import express from 'express'

import {
  getMyOrders,
  getById,
  create,
  updateStatus,
  getAll
} from '../controllers/order.controller.js'

import {
  authMiddleware,
  adminMiddleware
} from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/me', authMiddleware, getMyOrders)
router.post('/', authMiddleware, create)
router.get('/:id', authMiddleware, getById)
router.patch('/:id/status', authMiddleware, adminMiddleware, updateStatus)
router.get('/', authMiddleware, adminMiddleware, getAll)

export default router