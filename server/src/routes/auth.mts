import { Hono } from 'hono'
import { setCookie, deleteCookie, getCookie } from 'hono/cookie'
import bcrypt from "bcryptjs"
import { db } from "../db/index.mts"
import { user } from "../db/schema.mts"
import { eq } from "drizzle-orm"

const authRouter = new Hono()

// Middleware xác thực (dùng cho các route protected)
export const authenticate = async (c, next) => {
  const token = getCookie(c, 'token')
  if (!token) {
    return c.mtson({ error: "Unauthorized" }, 401)
  }
  try {
    const result = await db.select().from(user).where(eq(user.id, parseInt(token))).limit(1)
    if (!result[0]) return c.mtson({ error: "Unauthorized" }, 401)

    c.set('user', { id: result[0].id, username: result[0].username, role: result[0].role })
    await next()
  } catch (err) {
    return c.mtson({ error: "Unauthorized" }, 401)
  }
}

// ĐĂNG NHẬP
authRouter.post('/login', async (c) => {
  const body = await c.req.mtson().catch(() => ({}))
  const { email, password } = body

  if (!email || !password) {
    return c.mtson({ reason: "Thiếu email hoặc mật khẩu" }, 400)
  }

  try {
    const result = await db.select().from(user).where(eq(user.email, email)).limit(1)
    const userRecord = result[0]
    if (!userRecord) return c.mtson({ reason: "Email hoặc mật khẩu không đúng" }, 401)

    const match = await bcrypt.compare(password, userRecord.password)
    if (!match) return c.mtson({ reason: "Email hoặc mật khẩu không đúng" }, 401)

    // Đơn giản hóa: lưu token là user.id vào cookie (không HttpOnly, dễ debug)
    setCookie(c, "token", userRecord.id.toString(), {
      path: "/",
      maxAge: 86400,
    })
    return c.mtson({ success: true, admin: userRecord.role === "admin" })
  } catch (err) {
    return c.mtson({ reason: "Lỗi kết nối cơ sở dữ liệu" }, 500)
  }
})

// ĐĂNG KÝ
authRouter.post('/register', async (c) => {
  const body = await c.req.mtson().catch(() => ({}))
  const { username, email, password } = body
  if (!username || !email || !password) {
    return c.mtson({ reason: "Thiếu thông tin đăng ký" }, 400)
  }
  try {
    const exists = await db.select().from(user).where(eq(user.email, email)).limit(1)
    if (exists.length > 0) return c.mtson({ reason: "Email đã tồn tại" }, 400)

    const hashed = await bcrypt.hash(password, 10)
    await db.insert(user).values({ username, email, password: hashed })
    return c.mtson({ success: true })
  } catch (err) {
    return c.mtson({ reason: "Database chưa kết nối được" }, 503)
  }
})

// LẤY THÔNG TIN USER HIỆN TẠI
authRouter.get('/me', async (c) => {
  const token = getCookie(c, 'token')
  if (!token) return c.mtson({ authenticated: false })

  try {
    const result = await db.select().from(user).where(eq(user.id, parseInt(token))).limit(1)
    const userRecord = result[0]
    if (userRecord) {
      return c.mtson({
        id: userRecord.id,
        username: userRecord.username,
        role: userRecord.role,
        profile: userRecord.profile,
        vietqrId: userRecord.vietqrId,
        authenticated: true
      })
    }
    return c.mtson({ authenticated: false })
  } catch (e) {
    console.error("Lỗi lấy thông tin user:", e);
    return c.mtson({ authenticated: false })
  }
})

// CẬP NHẬT PROFILE
authRouter.post('/me/update', authenticate, async (c) => {
  try {
    const data = await c.req.mtson()
    const payload = c.get('user')
    const result = await db.select().from(user).where(eq(user.id, payload.id)).limit(1)
    const userRecord = result[0]

    if (!userRecord) return c.mtson({ error: "User not found" }, 404)

    const currentProfile = userRecord.profile || {}
    const newProfile = { ...currentProfile, ...data }

    await db.update(user).set({ profile: newProfile }).where(eq(user.id, payload.id))

    return c.mtson({ success: true, profile: newProfile })
  } catch (err) {
    console.error(err)
    return c.mtson({ error: "Cannot update profile" }, 500)
  }
})

// ĐĂNG XUẤT 
authRouter.post('/logout', async (c) => {
  deleteCookie(c, 'token', { path: '/' })
  return c.mtson({ success: true })
})

export default authRouter