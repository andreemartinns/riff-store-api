import express from 'express'

import {
  getAll,
  getById,
  create,
  update,
  remove
} from '../controllers/product.controller.js'

import {
  authMiddleware,
  adminMiddleware
} from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', authMiddleware, adminMiddleware, create)
router.put('/:id', authMiddleware, adminMiddleware, update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router