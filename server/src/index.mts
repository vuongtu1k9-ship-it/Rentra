import { Hono } from 'hono'
import { serveStatic, createBunWebSocket } from 'hono/bun'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { db } from './db/index.mts'
import { product, user } from './db/schema.mts'
import { eq } from 'drizzle-orm'
import uploadRouter from './routes/upload.mts'
import authRouter from './routes/auth.mts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const app = new Hono()
const { upgradeWebSocket, websocket } = createBunWebSocket()

// State quản lý WebSockets cho các cuộc họp
const meetingRooms = new Map() // meetingId -> Set<WS>

// CORS middleware
app.use('*', async (c, next) => {
  await next()
  c.res.headers.set('Access-Control-Allow-Origin', '*')
  c.res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
})

// Mount Upload Router
app.route('/api/upload', uploadRouter)

// Mount Auth Router
app.route('/api', authRouter)

// ==========================================
// ADMIN API: QUẢN LÝ SẢN PHẨM
// ==========================================

// Lấy danh sách toàn bộ sản phẩm
app.get('/api/admin/products', async (c) => {
  try {
    const products = await db.select().from(product)
    return c.json({ products })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Lỗi khi lấy danh sách sản phẩm' }, 500)
  }
})

// Thêm mới sản phẩm
app.post('/api/admin/products', async (c) => {
  try {
    const body = await c.req.json()

    // --- MẸO DEV ---
    // Vì DB đang rỗng chưa có User nào, mà bảng Product bắt buộc phải có sellerId (Khóa ngoại)
    // Nên tôi sẽ tự động tạo một User ảo (ID=1) nếu nó chưa tồn tại để bạn test UI không bị lỗi!
    let adminUser = await db.select().from(user).where(eq(user.id, 1));
    if (adminUser.length === 0) {
      await db.insert(user).values({
        id: 1,
        username: 'admin_test',
        email: 'admin@rentra.vn',
        role: 'admin'
      });
    }

    // Gắn cứng sellerId = 1 (Tài khoản admin ảo vừa tạo ở trên)
    body.sellerId = 1;

    // Insert sản phẩm vào DB
    const [newProduct] = await db.insert(product).values(body).returning()
    return c.json({ success: true, product: newProduct }, 201)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Lỗi khi lưu sản phẩm vào DB' }, 500)
  }
})

// Cập nhật sản phẩm
app.put('/api/admin/products', async (c) => {
  try {
    const body = await c.req.json()
    const { id, ...data } = body
    if (!id) return c.json({ error: 'Thiếu ID sản phẩm' }, 400)

    data.editAt = new Date(); // Cập nhật giờ sửa mới nhất

    const [updated] = await db.update(product).set(data).where(eq(product.id, id)).returning()
    return c.json({ success: true, product: updated })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Lỗi khi cập nhật sản phẩm' }, 500)
  }
})

// Xóa sản phẩm
app.delete('/api/admin/products/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json().catch(() => ({}));

    // Logic của bạn: Nếu truyền quantity thì giảm số lượng, nếu không thì xóa hẳn
    if (body.quantity) {
      const existing = await db.select().from(product).where(eq(product.id, id));
      if (existing.length === 0) return c.json({ error: 'Không tìm thấy sản phẩm' }, 404);

      const currentQty = existing[0].quantity;
      if (currentQty <= body.quantity) {
        await db.delete(product).where(eq(product.id, id)); // Số lượng xóa lớn hơn tồn kho -> Xóa sạch
        return c.json({ success: true, removed: true });
      } else {
        const newQuantity = currentQty - body.quantity;
        await db.update(product).set({ quantity: newQuantity }).where(eq(product.id, id)); // Giảm số lượng
        return c.json({ success: true, removed: false, newQuantity });
      }
    } else {
      await db.delete(product).where(eq(product.id, id));
      return c.json({ success: true, removed: true });
    }
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Lỗi khi xóa sản phẩm' }, 500)
  }
})

// ==========================================
// AI AGENT API: CHAT (BẢO MẬT API KEY)
// ==========================================
app.post('/api/silver/chat', async (c) => {
  try {
    const { messages } = await c.req.json();

    // Đọc API Key từ file .env (Bảo mật tuyệt đối, không lộ ra Frontend)
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) return c.json({ error: 'Thiếu cấu hình API Key ở Backend' }, 500);

    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data = await response.json();
    return c.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    return c.json({ error: "Lỗi kết nối tới hệ thống AI" }, 500);
  }
})

// ==========================================
// MEETING API: WEBSOCKET REAL-TIME CHAT
// ==========================================

app.get('/api/ws/meeting/:id', upgradeWebSocket((c) => {
  const meetingId = c.req.param('id')

  return {
    onOpen(event, ws) {
      if (!meetingRooms.has(meetingId)) {
        meetingRooms.set(meetingId, new Set())
      }
      meetingRooms.get(meetingId).add(ws)
      console.log(`[WS] Client joined meeting ${meetingId}`)
    },
    onMessage(event, ws) {
      // Broadcast message tới toàn bộ người trong phòng
      const clients = meetingRooms.get(meetingId)
      if (clients) {
        for (const client of clients) {
          // Gửi cho tất cả mọi người (kể cả người gửi để hiển thị)
          // Hoặc client !== ws nếu không muốn gửi lại cho chính người gửi
          client.send(event.data)
        }
      }
    },
    onClose(event, ws) {
      const clients = meetingRooms.get(meetingId)
      if (clients) {
        clients.delete(ws)
        if (clients.size === 0) {
          meetingRooms.delete(meetingId)
        }
      }
      console.log(`[WS] Client left meeting ${meetingId}`)
    }
  }
}))

// ==========================================
// CART API (DUMMY CHO UI)
// ==========================================

app.get('/api/user/cart', (c) => {
  return c.json({ items: [] })
})

app.post('/api/cart', async (c) => {
  // Giả lập lưu đơn hàng thành công cho cả khách vãng lai
  return c.json({ success: true, message: 'Đặt hàng thành công!' })
})

// Phục vụ giao diện Frontend (Production)
if (process.env.NODE_ENV === 'production') {
  app.use('/assets', serveStatic({ root: join(__dirname, '../../dist/client') }))
  app.use('/favicon.ico', serveStatic({ path: join(__dirname, '../../dist/client/favicon.ico') }))
  app.get('*', async (c) => {
    const indexPath = join(__dirname, '../../dist/client/index.html')
    const html = await Bun.file(indexPath).text()
    return c.html(html)
  })
} else {
  // Development
  app.get('*', (c) => {
    return c.text('API của Rentra đang chạy rò rò ở port 3000! Giao diện Frontend ở port 5173 nhé.')
  })
}

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
  websocket,
}
