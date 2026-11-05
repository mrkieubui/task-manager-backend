import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Nạp biến môi trường từ tệp .env
dotenv.config();

// Khởi tạo connection pool PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Khởi tạo Prisma Driver Adapter (yêu cầu bắt buộc từ Prisma v7)
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = process.env.PORT || 5000;

// Cấu hình Middleware
app.use(cors());
app.use(express.json());

// GET: Lấy danh sách nhiệm vụ
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// POST: Tạo nhiệm vụ mới
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!title) return res.status(400).json({ error: "Title là bắt buộc" });

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "medium", // Nếu không truyền sẽ lấy 'medium'}
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// PUT: Cập nhật trạng thái/nội dung
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: { title, description, completed, priority },
    });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// DELETE: Xóa nhiệm vụ
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
