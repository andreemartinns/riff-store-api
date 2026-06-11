import 'dotenv/config'

import express from 'express'

import cors from 'cors'

import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import categoryRoutes from './routes/category.routes.js'
import orderRoutes from './routes/order.routes.js'

const app = express()

app.use(cors({
  origin: '*'
}))
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/categories', categoryRoutes)
app.use('/orders', orderRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(` Riff Store API rodando na porta ${PORT}`)
})