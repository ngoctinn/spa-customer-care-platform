# app/services/images_service.py
"""Các hàm tiện ích dùng chung cho xử lý hình ảnh."""

from __future__ import annotations
from uuid import UUID
from typing import List, Optional, Type
from fastapi import HTTPException, UploadFile, status
from sqlmodel import Session, SQLModel, select

from app.core import supabase_client
from app.models.catalog_model import Image
from app.models.products_model import Product
from app.models.services_model import Service
from app.models.treatment_plans_model import TreatmentPlan
from app.models.association_tables import (
    ProductImageLink,
    ServiceImageLink,
    TreatmentPlanImageLink,
)

# Định nghĩa các kiểu để dễ quản lý
OwnerModel = Product | Service | TreatmentPlan
LinkModel = ProductImageLink | ServiceImageLink | TreatmentPlanImageLink

OWNER_CONFIG = {
    "product": {
        "model": Product,
        "link_model": ProductImageLink,
        "link_field": "product_id",
    },
    "service": {
        "model": Service,
        "link_model": ServiceImageLink,
        "link_field": "service_id",
    },
    "treatment_plan": {
        "model": TreatmentPlan,
        "link_model": TreatmentPlanImageLink,
        "link_field": "treatment_plan_id",
    },
}

# ==========================================
# CÁC HÀM CỐT LÕI XỬ LÝ ẢNH
# ==========================================


async def create_image_to_library(
    db: Session,
    *,
    file: UploadFile,
    alt_text: Optional[str] = None,
) -> Image:
    """
    Tải một file ảnh lên storage và tạo bản ghi trong DB.
    """
    if not getattr(file, "filename", None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File không hợp lệ hoặc không được cung cấp.",
        )

    image_url = await supabase_client.upload_image(file=file)
    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể tải ảnh lên kho lưu trữ.",
        )

    db_image = Image(url=image_url, alt_text=alt_text or file.filename)
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


def get_all_images(db: Session) -> List[Image]:
    """Lấy danh sách tất cả ảnh trong kho lưu trữ."""
    images = db.exec(select(Image).where(Image.is_deleted == False)).all()
    return images


def get_image_by_id(db: Session, image_id: UUID) -> Image:
    """Lấy ảnh theo ID, nếu không tìm thấy sẽ raise 404."""
    image = db.get(Image, image_id)
    if not image or image.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy hình ảnh với ID {image_id}",
        )
    return image


def delete_image(db: Session, db_image: Image) -> Image:
    """Xóa mềm một ảnh."""
    db_image.is_deleted = True
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


# ==========================================
# HÀM ĐỂ LIÊN KẾT ẢNH VỚI CÁC THỰC THỂ
# ==========================================


async def create_and_link_images(
    db: Session,
    *,
    owner_entity: OwnerModel,
    owner_type: str,
    new_images: Optional[List[UploadFile]] = None,
    alt_text: Optional[str] = None,
) -> List[Image]:
    """Tải ảnh mới lên, tạo record trong DB và liên kết với chủ sở hữu."""
    if not new_images:
        return []

    created_images = []
    config = OWNER_CONFIG[owner_type]
    LinkModel = config["link_model"]

    for image_file in new_images:
        if not getattr(image_file, "filename", None):
            continue

        image_url = await supabase_client.upload_image(file=image_file)
        if not image_url:
            # Có thể log lỗi ở đây thay vì raise exception ngay lập tức
            print(f"Failed to upload image: {image_file.filename}")
            continue

        db_image = Image(url=image_url, alt_text=alt_text or owner_entity.name)
        db.add(db_image)
        db.commit()
        db.refresh(db_image)

        # Tạo liên kết
        link = LinkModel(
            **{config["link_field"]: owner_entity.id, "image_id": db_image.id}
        )
        db.add(link)
        created_images.append(db_image)

    db.commit()
    return created_images


async def sync_images_for_entity(
    db: Session,
    *,
    entity: OwnerModel,
    owner_type: str,
    existing_image_ids: Optional[List[UUID]],
    primary_image_id: Optional[UUID],
    new_images: Optional[List[UploadFile]] = None,
):
    """
    Hàm chính để đồng bộ hóa tất cả các hình ảnh cho một thực thể (Product, Service, TreatmentPlan).
    - Xóa các liên kết cũ không còn dùng.
    - Thêm các liên kết mới.
    - Tải lên và liên kết các hình ảnh mới.
    - Cập nhật ảnh chính (primary_image_id).
    """
    if owner_type not in OWNER_CONFIG:
        raise ValueError("Invalid owner_type specified.")

    config = OWNER_CONFIG[owner_type]
    LinkModel: Type[SQLModel] = config["link_model"]
    link_field: str = config["link_field"]
    entity_id = entity.id

    # 1. Xử lý các ảnh mới tải lên
    await create_and_link_images(
        db,
        owner_entity=entity,
        owner_type=owner_type,
        new_images=new_images,
        alt_text=entity.name,
    )

    # 2. Đồng bộ các ảnh đã có (existing_image_ids)
    if existing_image_ids is not None:
        # Lấy tất cả các liên kết hiện tại của thực thể
        current_links_stmt = select(LinkModel).where(
            getattr(LinkModel, link_field) == entity_id
        )
        current_links = db.exec(current_links_stmt).all()
        current_image_ids = {link.image_id for link in current_links}

        new_image_ids = set(existing_image_ids)

        # Xóa các liên kết không còn trong danh sách mới
        ids_to_remove = current_image_ids - new_image_ids
        for link in current_links:
            if link.image_id in ids_to_remove:
                db.delete(link)

        # Thêm các liên kết mới
        ids_to_add = new_image_ids - current_image_ids
        for image_id in ids_to_add:
            # Kiểm tra xem ảnh có tồn tại không
            image = db.get(Image, image_id)
            if not image or image.is_deleted:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Không tìm thấy hình ảnh với ID {image_id}",
                )
            link = LinkModel(**{link_field: entity_id, "image_id": image_id})
            db.add(link)

    # 3. Cập nhật primary_image_id
    if primary_image_id is not None:
        # Kiểm tra xem ảnh chính có thực sự được liên kết với thực thể không
        final_images_stmt = select(LinkModel.image_id).where(
            getattr(LinkModel, link_field) == entity_id
        )
        final_image_ids = db.exec(final_images_stmt).all()
        if primary_image_id not in final_image_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ảnh chính được chọn không thuộc danh sách hình ảnh của thực thể.",
            )
    entity.primary_image_id = primary_image_id
    db.add(entity)

    db.commit()
    db.refresh(entity)
