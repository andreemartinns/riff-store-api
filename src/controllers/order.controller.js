import prisma from '../lib/prisma.js'

export async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, brand: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(orders)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function getById(req, res) {
  const { id } = req.params

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' })
    }

    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Acesso negado.' })
    }

    return res.status(200).json(order)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function create(req, res) {
  const { items } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'O pedido deve conter ao menos um item.' })
  }

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({
        message: 'Cada item deve ter productId e quantity válidos.'
      })
    }
  }

  try {
    const productIds = items.map(i => i.productId)

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    if (products.length !== productIds.length) {
      return res.status(404).json({
        message: 'Um ou mais produtos não foram encontrados.'
      })
    }

    for (const item of items) {
      const product = products.find(p => p.id === item.productId)

      if (product.stock < item.quantity) {
        return res.status(409).json({
          message: `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}`
        })
      }
    }

    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price
      }
    })

    const total = orderItems.reduce((sum, item) => {
      return sum + Number(item.unitPrice) * item.quantity
    }, 0)

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          total,
          items: { create: orderItems }
        },
        include: {
          items: {
            include: {
              product: { select: { name: true, brand: true } }
            }
          }
        }
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        })
      }

      return newOrder
    })

    return res.status(201).json(order)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function updateStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  const validStatuses = [
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ]

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Status inválido. Use: ${validStatuses.join(', ')}`
    })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) }
    })

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado.' })
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    })

    return res.status(200).json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function getAll(req, res) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(orders)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}