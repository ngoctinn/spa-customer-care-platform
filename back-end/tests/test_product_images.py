import uuid
from sqlmodel import select

from app.models.catalog_model import Category, Image
from app.schemas.catalog_schema import CategoryTypeEnum


async def _fake_upload_image(file, file_name=None):
    return "https://cdn.example.com/new-image.jpg"


def test_create_product_with_new_and_existing_images(client, session, monkeypatch):
    category = Category(
        name="Dưỡng da",
        description="Danh mục sản phẩm",
        category_type=CategoryTypeEnum.product,
    )
    extra_category = Category(
        name="Chăm sóc body",
        description="Danh mục sản phẩm toàn thân",
        category_type=CategoryTypeEnum.product,
    )
    session.add(category)
    session.add(extra_category)
    session.commit()
    session.refresh(category)
    session.refresh(extra_category)

    reusable_image = Image(
        url="https://cdn.example.com/reuse.jpg",
        alt_text="Hình ảnh dùng lại",
    )
    session.add(reusable_image)
    session.commit()
    session.refresh(reusable_image)

    monkeypatch.setattr(
        "app.core.supabase_client.upload_image", _fake_upload_image
    )

    multipart_data = [
        ("name", (None, "Tinh chất Vitamin C")),
        ("description", (None, "Sáng da và giảm thâm")),
        ("price", (None, "350000")),
        ("stock", (None, "20")),
        ("is_retail", (None, "true")),
        ("is_consumable", (None, "false")),
        ("base_unit", (None, "chai")),
        ("category_ids", (None, str(category.id))),
        ("category_ids", (None, str(extra_category.id))),
        ("existing_image_ids", (None, str(reusable_image.id))),
        ("images", ("new-image.jpg", b"fake-image-bytes", "image/jpeg")),
    ]

    response = client.post("/products", files=multipart_data)
    assert response.status_code == 201

    payload = response.json()
    category_ids = {item["id"] for item in payload["categories"]}
    assert category_ids == {str(category.id), str(extra_category.id)}

    image_urls = {image["url"] for image in payload["images"]}
    assert "https://cdn.example.com/new-image.jpg" in image_urls
    assert reusable_image.url in image_urls

    session.refresh(reusable_image)
    assert reusable_image.product_id == uuid.UUID(payload["id"])

    new_image = session.exec(
        select(Image).where(Image.url == "https://cdn.example.com/new-image.jpg")
    ).first()
    assert new_image is not None
    assert new_image.product_id == uuid.UUID(payload["id"])
    assert payload["primary_image_id"] == str(reusable_image.id)
