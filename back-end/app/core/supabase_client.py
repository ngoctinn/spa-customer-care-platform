# back-end/app/core/supabase_client.py
import uuid
from urllib.parse import urlparse, urlunparse  # Thêm import này
from supabase import create_client, Client
from app.core.config import settings

# ... (phần khởi tạo supabase client giữ nguyên)
url: str = settings.SUPABASE_URL
key: str = settings.SUPABASE_KEY
supabase: Client = create_client(url, key)

bucket_name: str = settings.SUPABASE_BUCKET_NAME


async def upload_image(file, file_name: str = None) -> str:
    """
    Tải file hình ảnh lên Supabase Storage và trả về URL công khai đã được làm sạch.
    """
    if not file:
        return None

    if not file_name:
        file_ext = file.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"

    try:
        contents = await file.read()

        supabase.storage.from_(bucket_name).upload(
            path=file_name,
            file=contents,
            file_options={"content-type": file.content_type},
        )

        public_url_raw = supabase.storage.from_(bucket_name).get_public_url(file_name)

        # ---- PHẦN CẬP NHẬT QUAN TRỌNG ----
        # Phân tích URL thành các thành phần
        parsed_url = urlparse(public_url_raw)
        # Tạo lại URL mà không có phần query
        clean_url = urlunparse(
            (parsed_url.scheme, parsed_url.netloc, parsed_url.path, "", "", "")
        )
        # ------------------------------------

        return clean_url  # Trả về URL đã được làm sạch

    except Exception as e:
        print(f"Lỗi khi tải ảnh lên Supabase: {e}")
        return None
