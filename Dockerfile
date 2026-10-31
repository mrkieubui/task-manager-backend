# Sử dụng Node.js 22 LTS Alpine cho giai đoạn build
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .
RUN npm run build

# Giai đoạn production image
FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json ./
# Sử dụng --omit=dev thay thế cho --only=production (cú pháp chuẩn của npm v10+)
RUN npm install --omit=dev

# Copy toàn bộ thư mục prisma (bao gồm schema.prisma và thư mục migrations)
COPY prisma ./prisma/
COPY prisma7.config.ts ./

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 5000

CMD ["node", "dist/server.js"]

