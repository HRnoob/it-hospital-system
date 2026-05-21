import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-32-chars-minimum'

export interface JWTPayload {
  id: string
  email: string
  name: string
  role: string
}

export function signJWT(payload: JWTPayload, expiresIn: string | number = '15m'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any })
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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' as any })
}

export function verifyRefreshToken(token: string): Promise<{ id: string }> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      else resolve(decoded as { id: string })
    })
  })
}