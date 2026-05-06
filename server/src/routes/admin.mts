import { db, product, user, order } from '../db/index.mts';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

export default async function adminRoutes(fastify, options) {
  let mockProducts = [];

  // 1. Lấy danh sách sản phẩm (public + mock fallback)
  fastify.get('/api/admin/products', async (request, reply) => {
    try {
      const result = await db.select().from(product).orderBy(desc(product.addAt));
      return { products: result, total: result.length };
    } catch (err) {
      console.error("DB ERROR DETAILS:", err);
      return { products: mockProducts, total: mockProducts.length, mock: true };
    }
  });

  // 2. Chặn/Ẩn sản phẩm (Đổi status)
  const toggleStatusSchema = z.object({
    id: z.number(),
    status: z.boolean()
  });

  fastify.post('/api/admin/products/toggle-status', async (request, reply) => {
    try {
      const { id, status } = toggleStatusSchema.parse(request.body);
      await db.update(product).set({ status, updatedAt: new Date() }).where(eq(product.id, id));
      return { success: true };
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dữ liệu không hợp lệ' });
      return reply.status(500).send({ error: 'Không thể cập nhật trạng thái' });
    }
  });

  // 3. Xóa sản phẩm (hỗ trợ xóa một phần theo số lượng)
  const deleteProductSchema = z.object({
    quantity: z.number().optional()
  });

  fastify.delete('/api/admin/products/:id', async (request, reply) => {
    const { id } = request.params;
    let quantity = 0;

    try {
      const body = deleteProductSchema.parse(request.body || {});
      quantity = body.quantity ?? 0;
    } catch { }

    const productId = parseInt(id);

    try {
      const result = await db.select().from(product).where(eq(product.id, productId));
      const productRecord = result[0];

      if (!productRecord) {
        return reply.status(404).send({ error: 'Sản phẩm không tìm thấy' });
      }

      const currentQty = productRecord.quantity ?? 0;

      if (!quantity || currentQty <= quantity) {
        await db.delete(product).where(eq(product.id, productId));
        return { removed: true };
      } else {
        const newQty = currentQty - quantity;
        await db.update(product).set({ quantity: newQty, updatedAt: new Date() }).where(eq(product.id, productId));
        return { removed: false, newQuantity: newQty };
      }
    } catch (err) {
      const idx = mockProducts.findIndex(p => p.id === productId);
      if (idx !== -1) {
        const product = mockProducts[idx];
        const currentQty = product.quantity ?? 0;

        if (!quantity || currentQty <= quantity) {
          mockProducts.splice(idx, 1);
          return { removed: true };
        } else {
          mockProducts[idx].quantity = currentQty - quantity;
          return { removed: false, newQuantity: mockProducts[idx].quantity };
        }
      }
      return reply.status(500).send({ error: 'Không thể xóa sản phẩm' });
    }
  });

  // 4. Tạo sản phẩm mới (có video + hình ảnh)
  const createProductSchema = z.object({
    name: z.string().min(1),
    price: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().optional().default(0),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    status: z.boolean().optional().default(true),
    lat: z.number().optional(),
    lng: z.number().optional()
  });

  fastify.post('/api/admin/products', async (request, reply) => {
    try {
      const data = createProductSchema.parse(request.body);

      try {
        const result = await db.insert(product).values({
          name: data.name,
          price: data.price,
          description: data.description || '',
          category: data.category || 'Demo',
          quantity: data.quantity ?? 0,
          imageUrl: data.imageUrl || '',
          videoUrl: data.videoUrl || '',
          status: data.status ?? true,
          lat: data.lat ?? null,
          lng: data.lng ?? null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();
        return { success: true, product: result[0] };
      } catch (dbErr) {
        console.error('DB Error:', dbErr.message);
        const newProduct = {
          id: Date.now(),
          name: data.name,
          price: data.price,
          description: data.description || '',
          category: data.category || 'Demo',
          quantity: data.quantity ?? 0,
          imageUrl: data.imageUrl || '',
          videoUrl: data.videoUrl || '',
          status: data.status ?? true,
          createdAt: new Date().toISOString()
        };
        mockProducts = [newProduct, ...mockProducts];
        return { success: true, product: newProduct, mock: true };
      }
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dữ liệu không hợp lệ', details: err.errors });
      return reply.status(500).send({ error: 'Không thể tạo sản phẩm' });
    }
  });

  // 5. Cập nhật sản phẩm
  const updateProductSchema = z.object({
    id: z.number(),
    name: z.string().min(1).optional(),
    price: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    quantity: z.number().optional(),
    imageUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    status: z.boolean().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
  });

  fastify.put('/api/admin/products', async (request, reply) => {
    try {
      const data = updateProductSchema.parse(request.body);
      const { id, ...updateData } = data;

      try {
        await db.update(product).set({ ...updateData, updatedAt: new Date() }).where(eq(product.id, id));
        return { success: true };
      } catch (dbErr) {
        const idx = mockProducts.findIndex(p => p.id === id);
        if (idx !== -1) {
          mockProducts[idx] = { ...mockProducts[idx], ...updateData };
          return { success: true, mock: true };
        }
        return reply.status(404).send({ error: 'Không tìm thấy sản phẩm' });
      }
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dữ liệu không hợp lệ', details: err.errors });
      return reply.status(500).send({ error: 'Không thể cập nhật sản phẩm' });
    }
  });

  // 6. Lấy danh sách người dùng (User Management)
  fastify.get('/api/admin/users', async (request, reply) => {
    try {
      const result = await db.select({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.addAt
      }).from(user);
      return { users: result };
    } catch (err) {
      return reply.status(500).send({ error: 'Lỗi khi lấy danh sách người dùng' });
    }
  });

  // 7. Thêm bình luận cho sản phẩm
  const commentSchema = z.object({
    text: z.string().min(1)
  });

  fastify.post('/api/admin/products/:id/comment', async (request, reply) => {
    const { id } = request.params;
    try {
      const { text } = commentSchema.parse(request.body);
      const productId = parseInt(id);

      try {
        const result = await db.select().from(product).where(eq(product.id, productId));
        const product = result[0];

        if (!product) {
          return reply.status(404).send({ error: 'Sản phẩm không tồn tại' });
        }

        const comments = product.cmt ? JSON.parse(product.cmt) : [];
        comments.push({
          user: 'Khách',
          text: text,
          createdAt: new Date().toISOString()
        });

        await db.update(product).set({ cmt: JSON.stringify(comments), updatedAt: new Date() }).where(eq(product.id, productId));
        return { success: true };
      } catch (dbErr) {
        const idx = mockProducts.findIndex(p => p.id === productId);
        if (idx !== -1) {
          const comments = mockProducts[idx].cmt || [];
          comments.push({ user: 'Khách', text: text, createdAt: new Date().toISOString() });
          mockProducts[idx].cmt = comments;
          return { success: true, mock: true };
        }
        return reply.status(404).send({ error: 'Sản phẩm không tìm thấy' });
      }
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dữ liệu không hợp lệ' });
      return reply.status(500).send({ error: 'Không thể thêm bình luận' });
    }
  });

  // 8. Giỏ hàng - Tạo đơn hàng
  const createOrderSchema = z.object({
    items: z.array(z.object({
      goods: z.number(),
      quantity: z.number(),
      owner: z.string().optional()
    })),
    shippingFee: z.number(),
    total: z.number(),
    shippingInfo: z.object({
      fullName: z.string(),
      address: z.string(),
      phone: z.string()
    }).optional()
  });

  fastify.post('/api/cart', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      const data = createOrderSchema.parse(request.body);
      const userId = request.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: 'Vui lòng đăng nhập để đặt hàng' });
      }

      try {
        const result = await db.insert(order).values({
          userId: userId,
          cart: data.items,
          shippingFee: data.shippingFee,
          total: data.total,
          paid: false
        }).returning();

        return { success: true, order: result[0] };
      } catch (dbErr) {
        // Fallback to mock if DB is down
        const newOrder = {
          id: Date.now(),
          ...data,
          status: 'Chưa trả tiền',
          createdAt: new Date().toISOString()
        };
        mockOrders.push(newOrder);
        return { success: true, order: newOrder, mock: true };
      }
    } catch (err) {
      if (err instanceof z.ZodError) return reply.status(400).send({ error: 'Dữ liệu không hợp lệ' });
      return reply.status(500).send({ error: 'Không thể tạo đơn hàng' });
    }
  });

  // 9. Lấy danh sách đơn hàng
  fastify.get('/api/orders', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    try {
      // If admin, see all orders. If user, see only their orders.
      let result;
      if (request.user.role === 'admin') {
        result = await db.select().from(order).orderBy(desc(order.id));
      } else {
        result = await db.select().from(order).where(eq(order.userId, request.user.id)).orderBy(desc(order.id));
      }
      return { orders: result };
    } catch (dbErr) {
      return { orders: mockOrders, mock: true };
    }
  });

  // 10. Xóa đơn hàng
  fastify.delete('/api/orders/:id', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    if (request.user.role !== 'admin') {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    const { id } = request.params;
    const orderId = parseInt(id);

    try {
      await db.delete(order).where(eq(order.id, orderId));
      return { success: true };
    } catch (dbErr) {
      const idx = mockOrders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        mockOrders.splice(idx, 1);
        return { success: true, mock: true };
      }
      return reply.status(404).send({ error: 'Đơn hàng không tìm thấy' });
    }
  });
}
