import prisma from '../lib/prisma.js'

export async function getAll(req, res) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      }
    })

    return res.status(200).json(categories)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function getById(req, res) {
  const { id } = req.params

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: { products: true }
    })

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada.' })
    }

    return res.status(200).json(category)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function create(req, res) {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({
      message: 'O nome da categoria é obrigatório.'
    })
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { name }
    })

    if (existing) {
      return res.status(409).json({
        message: 'Já existe uma categoria com esse nome.'
      })
    }

    const category = await prisma.category.create({
      data: { name }
    })

    return res.status(201).json(category)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function update(req, res) {
  const { id } = req.params
  const { name } = req.body

  if (!name) {
    return res.status(400).json({
      message: 'O nome da categoria é obrigatório.'
    })
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) }
    })

    if (!category) {
      return res.status(404).json({
        message: 'Categoria não encontrada.'
      })
    }

    const updated = await prisma.category.update({
      where: { id: Number(id) },
      data: { name }
    })

    return res.status(200).json(updated)
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}

export async function remove(req, res) {
  const { id } = req.params

  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        _count: { select: { products: true } }
      }
    })

    if (!category) {
      return res.status(404).json({
        message: 'Categoria não encontrada.'
      })
    }

    if (category._count.products > 0) {
      return res.status(409).json({
        message: 'Não é possível remover uma categoria que possui produtos.'
      })
    }

    await prisma.category.delete({
      where: { id: Number(id) }
    })

    return res.status(200).json({
      message: 'Categoria removida com sucesso.'
    })
  } catch (error) {
    return res.status(500).json({ message: 'Erro interno no servidor.' })
  }
}