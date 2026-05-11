import prisma from '../lib/prisma.js'

export async function getAll(req, res) {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(products)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function getById(req, res) {
  const { id } = req.params

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true }
    })

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' })
    }

    return res.status(200).json(product)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function create(req, res) {
  const { name, brand, description, price, stock, categoryId } = req.body

  if (!name || !brand || !price || !categoryId) {
    return res.status(400).json({ message: 'Nome, marca, preço e categoria são obrigatórios.' })
  }

  if (Number(price) <= 0) {
    return res.status(400).json({ message: 'O preço deve ser maior que zero.' })
  }

  try {
    const categoryExists = await prisma.category.findUnique({
      where: { id: Number(categoryId) }
    })

    if (!categoryExists) {
      return res.status(404).json({ message: 'Categoria não encontrada.' })
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        description,
        price: Number(price),
        stock: stock ? Number(stock) : 0,
        categoryId: Number(categoryId)
      },
      include: { category: true }
    })

    return res.status(201).json(product)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function update(req, res) {
  const { id } = req.params
  const { name, brand, description, price, stock, categoryId } = req.body

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    })

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' })
    }

    if (price !== undefined && Number(price) <= 0) {
      return res.status(400).json({ message: 'O preço deve ser maior que zero.' })
    }

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: Number(categoryId) }
      })

      if (!categoryExists) {
        return res.status(404).json({ message: 'Categoria não encontrada.' })
      }
    }

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(categoryId && { categoryId: Number(categoryId) })
      },
      include: { category: true }
    })

    return res.status(200).json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function remove(req, res) {
  const { id } = req.params

  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    })

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' })
    }

    await prisma.product.delete({
      where: { id: Number(id) }
    })

    return res.status(200).json({ message: 'Produto removido com sucesso.' })
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}