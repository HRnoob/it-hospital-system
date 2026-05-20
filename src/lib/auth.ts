import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me'

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: string
}

export function signJWT(payload: JWTPayload, expiresIn: string = '15m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyJWT(token: string): Promise<JWTPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded as JWTPayload)
    })
  })
}

export function signRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyRefreshToken(token: string): Promise<{ id: string }> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded as { id: string })
    })
  })
}