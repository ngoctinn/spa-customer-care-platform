# 🧰 Dev Commands Cheat Sheet

Tổng hợp các lệnh thường dùng cho dự án **Spa Customer Care Platform**.

---

## 🐍 Backend – FastAPI

```bash
# Kích hoạt môi trường ảo (Git Bash - Windows)
cd back-end
source .venv/Scripts/activate

# Cài đặt thư viện
pip install -r requirements.txt

# Chạy server
uvicorn app.main:app --reload

# Dừng server
Ctrl + C
```

# Tạo migration mới

alembic revision --autogenerate -m "update models"

# Áp dụng migration

alembic upgrade head

# Quay lại 1 phiên bản trước

alembic downgrade -1
