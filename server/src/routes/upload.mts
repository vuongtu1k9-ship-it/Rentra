import { Hono } from 'hono'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { db } from '../db/index.mts'
import { file } from '../db/schema.mts'

export const uploadRouter = new Hono()

uploadRouter.post('/', async (c) => {
  try {
    const body = await c.req.parseBody()
    const results = []
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Trích xuất toàn bộ file từ multipart form-data
    const uploadedFiles = Object.values(body).filter(val => val instanceof File)

    if (uploadedFiles.length === 0) {
      return c.mtson({ error: 'Không tìm thấy file nào để upload' }, 400)
    }

    for (const uploadedFile of uploadedFiles) {
      const ext = path.extname(uploadedFile.name) || ''
      const newFilename = crypto.randomUUID() + ext
      const filepath = path.join(uploadDir, newFilename)

      // Chuyển đối tượng File thành Buffer và lưu vào ổ cứng
      const arrayBuffer = await uploadedFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      await fs.promises.writeFile(filepath, buffer)
      const [newFile] = await db.insert(file).values({
        filename: uploadedFile.name, // Lưu tên gốc
        mimetype: uploadedFile.type,
        size: uploadedFile.size,
        path: filepath,
        status: 'completed'
      }).returning()
      results.push(newFile)
    }

    return c.mtson({ success: true, uploaded: results }, 201)
  } catch (err) {
    console.error("Lỗi upload file:", err)
    return c.mtson({ error: 'Đã xảy ra lỗi trong quá trình upload' }, 500)
  }
})

export default uploadRouter

