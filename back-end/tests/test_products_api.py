import uuid

from app.models.catalog_model import Category, Image
from app.models.products_model import Product
from app.schemas.catalog_schema import CategoryTypeEnum


def test_get_all_products_returns_data(client, session):
    category = Category(
        name="Chăm sóc da",
        description="Danh mục sản phẩm",
        category_type=CategoryTypeEnum.product,
    )
    session.add(category)
    session.commit()
    session.refresh(category)

    product = Product(
        name="Sữa rửa mặt",
        description="Làm sạch dịu nhẹ",
        price=120000,
        stock=10,
        is_retail=True,
        is_consumable=False,
        base_unit="chai",
        categories=[category],
    )
    session.add(product)
    session.commit()
    session.refresh(product)

    image = Image(
        url="https://example.com/image.jpg",
        alt_text="Sản phẩm",
        product_id=product.id,
    )
    session.add(image)
    session.commit()
    session.refresh(image)

    product.primary_image_id = image.id
    session.add(product)
    session.commit()
    session.refresh(product)

    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == str(product.id)
    assert len(data[0]["categories"]) == 1
    assert data[0]["categories"][0]["id"] == str(category.id)
    assert data[0]["images"][0]["url"] == image.url
    assert data[0]["primary_image_id"] == str(image.id)


def test_get_product_not_found_returns_404(client):
    response = client.get(f"/products/{uuid.uuid4()}")
    assert response.status_code == 404
    assert "Product" in response.json()["detail"]
