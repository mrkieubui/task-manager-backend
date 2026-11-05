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

// GET: Lấy danh sách task gốc kèm subtasks (Đã gộp chuẩn, loại bỏ trùng lặp)
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { parentId: null }, // Chỉ lấy task cấp 1 (task cha)
      include: {
        subtasks: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (error) {
    console.error("Lỗi lấy danh sách task:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// POST: Tạo nhiệm vụ mới (chấp nhận parentId nếu là subtask)
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, priority, parentId } = req.body;
    if (!title) return res.status(400).json({ error: "Title là bắt buộc" });

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        parentId: parentId ? Number(parentId) : null,
      },
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Lỗi tạo task:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

// PUT: Cập nhật nhiệm vụ theo ID
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, priority } = req.body;

    // Chỉ cập nhật các trường được truyền lên
    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (completed !== undefined) dataToUpdate.completed = completed;
    if (priority !== undefined) dataToUpdate.priority = priority;

    const updatedTask = await prisma.task.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });
    res.json(updatedTask);
  } catch (error) {
    console.error("Lỗi cập nhật task:", error);
    res.status(500).json({ error: "Lỗi máy chủ khi cập nhật" });
  }
});

// DELETE: Xóa nhiệm vụ
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id: Number(id) } });
    res.json({ message: "Đã xóa thành công" });
  } catch (error) {
    console.error("Lỗi xóa task:", error);
    res.status(500).json({ error: "Lỗi máy chủ" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});