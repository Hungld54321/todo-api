# 🚀 Deployment Guide - Railway

## Hướng dẫn Deploy Todo API lên Railway

### Bước 1: Chuẩn bị Account Railway

1. **Truy cập:** https://railway.app
2. **Đăng ký/Đăng nhập** bằng GitHub account
3. **Tạo Project mới**

### Bước 2: Deploy từ Local Repository

#### Option A: Deploy từ GitHub (Khuyến nghị)

1. **Push code lên GitHub:**
   ```bash
   # Tạo repo mới trên GitHub rồi:
   git remote add origin https://github.com/YOUR_USERNAME/todo-api.git
   git branch -M main
   git push -u origin main
   ```

2. **Trên Railway Dashboard:**
   - Click "New Project"
   - Chọn "Deploy from GitHub repo"
   - Chọn repository vừa tạo
   - Railway sẽ tự động deploy

#### Option B: Deploy từ Local với Railway CLI

1. **Cài Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login và Deploy:**
   ```bash
   railway login
   railway link  # Link to existing project hoặc tạo mới
   railway up    # Deploy project
   ```

### Bước 3: Cấu hình Environment Variables (Tùy chọn)

Trên Railway Dashboard > Your Project > Variables, thêm:

```
NODE_ENV=production
FRONTEND_URL=https://your-custom-domain.com  # (optional)
```

**Lưu ý:** `PORT` sẽ được Railway tự động set, không cần thêm manual.

### Bước 4: Kiểm tra Deployment

1. **Lấy URL từ Railway Dashboard**
   - URL sẽ có dạng: `https://your-app-name.railway.app`

2. **Test Health Check:**
   ```bash
   curl https://your-app-name.railway.app/health
   ```

3. **Test API:**
   ```bash
   # Create todo
   curl -X POST https://your-app-name.railway.app/api/todos \
     -H "Content-Type: application/json" \
     -d '{"text": "Test from Railway"}'
   
   # Get todos
   curl https://your-app-name.railway.app/api/todos
   ```

### Bước 5: Sử dụng với Claude Artifacts

1. **Copy Railway URL** (ví dụ: `https://todo-api-production.railway.app`)

2. **Trong Claude Artifacts, sử dụng:**
   ```javascript
   const API_BASE_URL = 'https://your-app-name.railway.app/api';
   
   // Các API calls
   fetch(`${API_BASE_URL}/todos`)
   fetch(`${API_BASE_URL}/todos`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ text: 'New todo' })
   })
   ```

## ✅ Features Đã Cấu hình cho Production

- ✅ **CORS**: Cho phép requests từ claude.ai
- ✅ **Port**: Dynamic port binding cho Railway
- ✅ **Database**: SQLite persistence với Railway volumes
- ✅ **Error Handling**: Production-ready error responses
- ✅ **Logging**: Server logs để debug
- ✅ **Health Check**: `/health` endpoint để monitoring

## 🔧 Troubleshooting

### Lỗi thường gặp:

1. **Build Failed:**
   - Kiểm tra `package.json` có đầy đủ dependencies
   - Đảm bảo Node.js version tương thích

2. **Port Issues:**
   - Đã cấu hình `PORT = process.env.PORT || 3001`
   - Listen trên `0.0.0.0` không phải `localhost`

3. **CORS Issues:**
   - Kiểm tra origin trong browser DevTools
   - Update `allowedOrigins` trong `server.js` nếu cần

4. **Database Issues:**
   - SQLite sẽ tự tạo file database
   - Railway sẽ persist data qua deployments

### Logs & Monitoring:

```bash
# Xem logs trên Railway CLI
railway logs

# Hoặc check trên Railway Dashboard > Deployments > View Logs
```

## 💰 Chi phí Railway

- **Free Tier**: $5 credit/tháng (đủ cho development)
- **Pro Plan**: $20/tháng (production apps)
- **Billing**: Dựa trên resource usage

## 🔄 Auto-Deploy

Railway sẽ tự động re-deploy khi:
- Push code mới lên GitHub branch đã connect
- Update environment variables
- Scale replicas

## 📱 Custom Domain (Optional)

Trên Railway Dashboard:
1. Go to Settings > Domains
2. Add custom domain
3. Configure DNS records
4. Update CORS nếu cần

---

**🎉 Sau khi deploy thành công, API sẽ accessible tại:**
`https://your-app-name.railway.app`

**Claude Artifacts có thể connect qua CORS được cấu hình sẵn!** 🚀