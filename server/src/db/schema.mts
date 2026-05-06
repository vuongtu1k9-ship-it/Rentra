import { pgTable, serial, text, integer, varchar, jsonb, timestamp, boolean, date, real, bigint, check } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

export const user = pgTable('User', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password'),
  role: varchar('role', { length: 50 }).default('user'),
  profile: jsonb('profile'), // Lưu avatarId (là id trong file), name, phone, address, goods
  vietqrId: varchar('vietqrId', { length: 100 }), // Id liên kết với bảng file chứa ảnh QR
  addAt: timestamp('addAt', { withTimezone: true }).defaultNow(),
  editAt: timestamp('editAt', { withTimezone: true }).defaultNow(),
});

export const product = pgTable('Product', {
  id: serial('id').primaryKey(),
  sellerId: integer('sellerId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  price: integer('price').default(0),
  description: text('description'),
  category: varchar('category', { length: 150 }),
  status: boolean('status').default(true),
  media: jsonb('media'), // Array chứa các URL hình ảnh/video
  quantity: integer('quantity').default(0),
  mass: integer('mass'),
  expired: date('expired'),
  lwh: jsonb('lwh'), // Chiều dài, rộng, cao
  latitude: real('latitude'),
  longitude: real('longitude'),
  // Đã bỏ reviewId ở đây vì Review sẽ tự reference về Product (Quan hệ 1-Nhiều)
  addAt: timestamp('addAt', { withTimezone: true }).defaultNow(),
  editAt: timestamp('editAt', { withTimezone: true }).defaultNow(),
}, (table) => ({
  mediaLimit: check('media_limit', sql`jsonb_array_length(COALESCE(${table.media}, '[]'::jsonb)) <= 5`)
}));

export const review = pgTable('Review', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: integer('productId').notNull().references(() => product.id, { onDelete: 'cascade' }),
  rating: integer('rating').default(5), // Thêm cột rating sao
  cmt: jsonb('cmt').notNull(),
  addAt: timestamp('addAt', { withTimezone: true }).defaultNow(),
  editAt: timestamp('editAt', { withTimezone: true }).defaultNow(),
});

export const file = pgTable('File', {
  id: serial('id').primaryKey(),
  userId: integer('userId').references(() => user.id, { onDelete: 'set null' }), // Ai là người upload file này
  filename: text('filename').notNull(),
  mimetype: varchar('mimetype', { length: 100 }),
  size: bigint('size', { mode: 'number' }),
  path: text('path'),
  status: varchar('status', { length: 50 }).default('pending'),
  addAt: timestamp('addAt', { withTimezone: true }).defaultNow(),
});

export const cart = pgTable('Cart', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: integer('productId').notNull().references(() => product.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(1), // Thay đổi mặc định thành 1
  addAt: timestamp('addAt', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).defaultNow(),
});

export const order = pgTable('Order', {
  id: serial('id').primaryKey(),
  userId: integer('userId').notNull().references(() => user.id, { onDelete: 'restrict' }),
  cart: jsonb('cart').notNull(), // Lưu snapshot của giỏ hàng lúc thanh toán
  shippingInfo: jsonb('shippingInfo'), // Thêm thông tin giao hàng (địa chỉ, số đt)
  shippingFee: integer('shippingFee').default(0), // Phí vận chuyển
  total: integer('total').default(0), // Tổng tiền thanh toán (bao gồm cả ship)
  status: varchar('status', { length: 50 }).default('pending'), // Trạng thái đơn hàng (pending, processing, shipping, delivered, cancelled)
  paid: boolean('paid').default(false), // Trạng thái thanh toán (true: đã trả, false: chưa)
  paidAt: timestamp('paidAt', { withTimezone: true }), // Thời điểm thanh toán thành công
  addAt: timestamp('addAt', { withTimezone: true }).defaultNow(),
  editAt: timestamp('editAt', { withTimezone: true }).defaultNow(),
});

export const activity = pgTable('Activity', {
  id: serial('id').primaryKey(), // Đổi text -> serial cho đồng nhất
  userId: integer('userId').references(() => user.id, { onDelete: 'set null' }), // Quan hệ với User, giữ lại log nếu xoá user
  action: text('action'), // CREATE, DELETE, UPDATE, BUY, ASSEMBLE, COMMENT, UPLOAD_VIDEO, UPLOAD_IMAGE.
  message: text('message'),
  context: text('context'),
  requestId: text('requestId'),
  startDate: timestamp('startDate', { withTimezone: true }),
  endDate: timestamp('endDate', { withTimezone: true }),
  level: text('level'),
  metadata: jsonb('metadata'),
  limitValue: integer('limitValue'),
  skip: integer('skip'),
  lastActiveAt: timestamp('lastActiveAt', { withTimezone: true }), // Lưu thời điểm hoạt động cuối (để check Online/Offline)
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow()
});

export const assemply = pgTable('Assemply', {
  id: serial('id').primaryKey(), // Đổi text -> serial cho đồng nhất
  userId: integer('userId').references(() => user.id, { onDelete: 'set null' }),
  hostId: integer('hostId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: varchar('status', { length: 50 }).default('active'), // active, ended
  participants: jsonb('participants').default('[]'), // Danh sách người tham gia
  messages: jsonb('messages').default('[]'), // Tin nhắn chat trong cuộc họp
  addAt: timestamp('addAt', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('endedAt', { withTimezone: true }),
});


export const userRelations = relations(user, ({ many }) => ({
  products: many(product), // Một user (người bán) có thể đăng nhiều sản phẩm
  reviews: many(review), // Một user có nhiều đánh giá
  orders: many(order), // Một user có nhiều đơn hàng
  carts: many(cart), // Một user có nhiều item trong giỏ
  activities: many(activity), // Một user sinh ra nhiều log hoạt động
  files: many(file), // Một user tải lên nhiều video và ảnh 1 sản phầm và chỉ được 1 ảnh đại diện 1 ảnh VietQR
  assemply: many(assemply), // Các cuộc họp user tạo, cuộc họp user tham gia tin nhắn user gửi trong cuộc họp
}));

export const assemplyRelations = relations(assemply, ({ one }) => ({
  host: one(user, { fields: [assemply.hostId], references: [user.id] }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  seller: one(user, { fields: [product.sellerId], references: [user.id] }), // Sản phẩm thuộc về 1 người bán
  reviews: many(review), // Một sản phẩm có nhiều đánh giá
  carts: many(cart), // Một sản phẩm nằm trong nhiều giỏ hàng
}));

export const reviewRelations = relations(review, ({ one }) => ({
  author: one(user, { fields: [review.userId], references: [user.id] }),
  product: one(product, { fields: [review.productId], references: [product.id] }),
}));

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(user, { fields: [cart.userId], references: [user.id] }),
  product: one(product, { fields: [cart.productId], references: [product.id] }),
}));

export const orderRelations = relations(order, ({ one }) => ({
  user: one(user, { fields: [order.userId], references: [user.id] }),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  user: one(user, { fields: [activity.userId], references: [user.id] }),
}));

export const fileRelations = relations(file, ({ one }) => ({
  uploader: one(user, { fields: [file.userId], references: [user.id] }),
}));
