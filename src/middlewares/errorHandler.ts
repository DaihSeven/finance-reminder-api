import { Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  statusCode?: number
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message })
  }

  const businessErrors: Record<string, number> = {
    'User already exists':                          400,
    'Invalid credentials':                          401,
    'Conta não encontrada':                         404,
    'Conta já foi paga':                            400,
    'Telefone inválido. Use apenas números com DDD.': 400,
  }

  const status = businessErrors[err.message]
  if (status) {
    return res.status(status).json({ message: err.message })
  }
  console.error('[ErrorHandler]', err)
  return res.status(500).json({ message: 'Internal server error' })
}