"""Các hàm tiện ích dùng chung cho xử lý hình ảnh."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Dict, Iterable, List, Literal, Optional

from fastapi import HTTPException, UploadFile, status
from sqlmodel import Session, select

from app.core import supabase_client
from app.models.catalog_model import Image

OwnerType = Literal["product", "service", "treatment_plan"]


@dataclass(frozen=True)
class _ImageOwnerConfig:
    target_field: str
    other_fields: tuple[str, ...]


_OWNER_CONFIG: Dict[OwnerType, _ImageOwnerConfig] = {
    "product": _ImageOwnerConfig(
        target_field="product_id",
        other_fields=("service_id", "treatment_plan_id"),
    ),
    "service": _ImageOwnerConfig(
        target_field="service_id",
        other_fields=("product_id", "treatment_plan_id"),
    ),
    "treatment_plan": _ImageOwnerConfig(
        target_field="treatment_plan_id",
        other_fields=("product_id", "service_id"),
    ),
}


def _ensure_single_relation(
    *, product_id: Optional[uuid.UUID], service_id: Optional[uuid.UUID], treatment_plan_id: Optional[uuid.UUID]
) -> None:
    provided = [value for value in (product_id, service_id, treatment_plan_id) if value is not None]
    if len(provided) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mỗi hình ảnh chỉ được gắn với duy nhất một loại đối tượng (sản phẩm, dịch vụ hoặc liệu trình).",
        )


def _get_image_by_id(db: Session, image_id: uuid.UUID) -> Image:
    image = db.exec(
        select(Image).where(Image.id == image_id, Image.is_deleted == False)  # noqa: E712
    ).first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy hình ảnh với ID {image_id}.",
        )
    return image


async def create_image(
    db: Session,
    *,
    file: UploadFile,
    alt_text: Optional[str] = None,
    product_id: Optional[uuid.UUID] = None,
    service_id: Optional[uuid.UUID] = None,
    treatment_plan_id: Optional[uuid.UUID] = None,
) -> Image:
    """Tải ảnh lên dịch vụ lưu trữ và lưu metadata vào cơ sở dữ liệu."""

    _ensure_single_relation(
        product_id=product_id, service_id=service_id, treatment_plan_id=treatment_plan_id
    )

    if not getattr(file, "filename", None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tập tin hình ảnh không hợp lệ.",
        )

    image_url = await supabase_client.upload_image(file=file)
    if not image_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Không thể tải hình ảnh lên kho lưu trữ.",
        )

    db_image = Image(
        url=image_url,
        alt_text=alt_text,
        product_id=product_id,
        service_id=service_id,
        treatment_plan_id=treatment_plan_id,
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image


def list_images(
    db: Session,
    *,
    product_id: Optional[uuid.UUID] = None,
    service_id: Optional[uuid.UUID] = None,
    treatment_plan_id: Optional[uuid.UUID] = None,
) -> List[Image]:
    """Lấy danh sách hình ảnh, có thể lọc theo đối tượng sở hữu."""

    _ensure_single_relation(
        product_id=product_id, service_id=service_id, treatment_plan_id=treatment_plan_id
    )

    statement = select(Image).where(Image.is_deleted == False)  # noqa: E712

    if product_id is not None:
        statement = statement.where(Image.product_id == product_id)
    if service_id is not None:
        statement = statement.where(Image.service_id == service_id)
    if treatment_plan_id is not None:
        statement = statement.where(Image.treatment_plan_id == treatment_plan_id)

    return db.exec(statement).all()


def _apply_owner(image: Image, owner: OwnerType, entity_id: Optional[uuid.UUID]) -> None:
    config = _OWNER_CONFIG[owner]
    setattr(image, config.target_field, entity_id)
    for field in config.other_fields:
        setattr(image, field, None)


async def sync_entity_images(
    db: Session,
    *,
    entity,
    owner: OwnerType,
    new_images: Optional[List[UploadFile]] = None,
    existing_image_ids: Optional[Iterable[uuid.UUID]] = None,
    primary_image_id: Optional[uuid.UUID] = None,
    alt_text: Optional[str] = None,
) -> List[Image]:
    """Đồng bộ danh sách hình ảnh cho một đối tượng cụ thể."""

    if owner not in _OWNER_CONFIG:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Loại đối tượng hình ảnh không được hỗ trợ.",
        )

    current_images = [image for image in getattr(entity, "images", []) if not image.is_deleted]

    if existing_image_ids is None:
        ordered_existing_ids: List[uuid.UUID] = [image.id for image in current_images]
    else:
        ordered_existing_ids = list(dict.fromkeys(existing_image_ids))

    keep_ids = set(ordered_existing_ids)
    for image in current_images:
        if image.id not in keep_ids:
            _apply_owner(image, owner, None)
            db.add(image)

    ordered_images: List[Image] = []
    previous_primary_id: Optional[uuid.UUID] = getattr(entity, "primary_image_id", None)

    for image_id in ordered_existing_ids:
        image = _get_image_by_id(db, image_id)
        config = _OWNER_CONFIG[owner]
        current_owner_id = getattr(image, config.target_field)
        if current_owner_id not in (None, getattr(entity, "id", None)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Hình ảnh {image_id} đang được sử dụng bởi {owner} khác.",
            )
        _apply_owner(image, owner, getattr(entity, "id", None))
        db.add(image)
        ordered_images.append(image)

    for image_file in new_images or []:
        if not getattr(image_file, "filename", None):
            continue
        image_url = await supabase_client.upload_image(file=image_file)
        if not image_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Không thể tải hình ảnh lên kho lưu trữ.",
            )
        db_image = Image(
            url=image_url,
            alt_text=alt_text,
        )
        _apply_owner(db_image, owner, getattr(entity, "id", None))
        db.add(db_image)
        db.flush()
        ordered_images.append(db_image)

    resolved_primary_id: Optional[uuid.UUID] = None
    ordered_ids = [image.id for image in ordered_images]

    if primary_image_id is not None:
        if primary_image_id not in ordered_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ảnh chính được chọn không thuộc danh sách hình ảnh hiện tại.",
            )
        resolved_primary_id = primary_image_id
    elif previous_primary_id in ordered_ids:
        resolved_primary_id = previous_primary_id
    elif ordered_ids:
        resolved_primary_id = ordered_ids[0]

    if hasattr(entity, "primary_image_id"):
        entity.primary_image_id = resolved_primary_id
        db.add(entity)

    if hasattr(entity, "images"):
        entity.images = ordered_images

    return ordered_images
