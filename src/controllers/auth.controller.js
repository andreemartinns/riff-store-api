import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

export async function register(req, res) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Nome, email e senha são obrigatórios.'
    })
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'A senha deve ter pelo menos 6 caracteres.'
    })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        message: 'E-mail já cadastrado.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user
    })
  } catch (error) {
    console.log('REGISTER ERROR:', error)

    return res.status(500).json({
      message: 'Erro interno no servidor.'
    })
  }
}

export async function login(req, res) {
  const { email, password } = req.body

  console.log('LOGIN BODY:', req.body)

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email e senha são obrigatórios.'
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    console.log('USER FOUND:', user)

    if (!user) {
      return res.status(401).json({
        message: 'Credenciais inválidas.'
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    console.log('PASSWORD MATCH:', passwordMatch)

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Credenciais inválidas.'
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.log('LOGIN ERROR:', error)

    return res.status(500).json({
      message: 'Erro interno no servidor.'
    })
  }
}