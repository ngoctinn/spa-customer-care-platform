"""Các hàm tiện ích dùng chung cho xử lý hình ảnh với thư viện ảnh dùng chung."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Dict, Iterable, List, Literal, Optional, Sequence, Set, Type

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import selectinload
from sqlmodel import Session, SQLModel, select

from app.core import supabase_client
from app.models.association_tables import (
    ProductImageLink,
    ServiceImageLink,
    TreatmentPlanImageLink,
)
from app.models.catalog_model import Image
from app.models.products_model import Product
from app.models.services_model import Service
from app.models.treatment_plans_model import TreatmentPlan

OwnerType = Literal["product", "service", "treatment_plan"]


@dataclass(frozen=True)
class _ImageOwnerConfig:
    entity_model: Type[SQLModel]
    link_model: Type[SQLModel]
    entity_field: str
    image_relationship_attr: str


_OWNER_CONFIG: Dict[OwnerType, _ImageOwnerConfig] = {
    "product": _ImageOwnerConfig(
        entity_model=Product,
        link_model=ProductImageLink,
        entity_field="product_id",
        image_relationship_attr="products",
    ),
    "service": _ImageOwnerConfig(
        entity_model=Service,
        link_model=ServiceImageLink,
        entity_field="service_id",
        image_relationship_attr="services",
    ),
    "treatment_plan": _ImageOwnerConfig(
        entity_model=TreatmentPlan,
        link_model=TreatmentPlanImageLink,
        entity_field="treatment_plan_id",
        image_relationship_attr="treatment_plans",
    ),
}


def _image_query_base():
    return (
        select(Image)
        .where(Image.is_deleted == False)  # noqa: E712
        .options(
            selectinload(Image.products),
            selectinload(Image.services),
            selectinload(Image.treatment_plans),
        )
    )


def _get_image_by_id(db: Session, image_id: uuid.UUID) -> Image:
    image = db.exec(_image_query_base().where(Image.id == image_id)).unique().first()
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy hình ảnh với ID {image_id}.",
        )
    return image


def _validate_entity_ids(
    db: Session, *, owner: OwnerType, entity_ids: Sequence[uuid.UUID]
) -> Set[uuid.UUID]:
    if not entity_ids:
        return set()

    config = _OWNER_CONFIG[owner]
    unique_ids = list(dict.fromkeys(entity_ids))
    statement = select(config.entity_model).where(
        config.entity_model.id.in_(unique_ids),  # type: ignore[attr-defined]
        config.entity_model.is_deleted == False,  # type: ignore[attr-defined]  # noqa: E712
    )
    found_entities = db.exec(statement).all()
    found_ids = {entity.id for entity in found_entities}
    missing_ids = set(unique_ids) - found_ids
    if missing_ids:
        missing_text = ", ".join(str(item) for item in sorted(missing_ids))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy {owner} với các ID: {missing_text}.",
        )
    return found_ids


def _link_image(
    db: Session, *, owner: OwnerType, entity_id: uuid.UUID, image_id: uuid.UUID
) -> None:
    config = _OWNER_CONFIG[owner]
    link_model = config.link_model
    filters = (
        getattr(link_model, config.entity_field) == entity_id,
        link_model.image_id == image_id,
    )
    existing = db.exec(select(link_model).where(*filters)).first()
    if existing is None:
        link_obj = link_model(  # type: ignore[call-arg]
            **{config.entity_field: entity_id, "image_id": image_id}
        )
        db.add(link_obj)


def _unlink_image(
    db: Session, *, owner: OwnerType, entity_id: uuid.UUID, image_id: uuid.UUID
) -> None:
    config = _OWNER_CONFIG[owner]
    link_model = config.link_model
    filters = (
        getattr(link_model, config.entity_field) == entity_id,
        link_model.image_id == image_id,
    )
    existing = db.exec(select(link_model).where(*filters)).first()
    if existing is not None:
        db.delete(existing)


def _sync_image_links_for_owner(
    db: Session,
    *,
    image: Image,
    owner: OwnerType,
    target_ids: Optional[Sequence[uuid.UUID]],
) -> None:
    if target_ids is None:
        return

    valid_ids = _validate_entity_ids(db, owner=owner, entity_ids=target_ids)
    config = _OWNER_CONFIG[owner]
    current_entities = getattr(image, config.image_relationship_attr)
    current_ids = {entity.id for entity in current_entities}

    for remove_id in current_ids - valid_ids:
        _unlink_image(db, owner=owner, entity_id=remove_id, image_id=image.id)

    for add_id in valid_ids - current_ids:
        _link_image(db, owner=owner, entity_id=add_id, image_id=image.id)


async def create_image(
    db: Session,
    *,
    file: UploadFile,
    alt_text: Optional[str] = None,
    product_ids: Optional[Sequence[uuid.UUID]] = None,
    service_ids: Optional[Sequence[uuid.UUID]] = None,
    treatment_plan_ids: Optional[Sequence[uuid.UUID]] = None,
) -> Image:
    """Tải ảnh lên dịch vụ lưu trữ và lưu metadata vào cơ sở dữ liệu."""

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
    )
    db.add(db_image)
    db.flush()

    _sync_image_links_for_owner(db, image=db_image, owner="product", target_ids=product_ids)
    _sync_image_links_for_owner(db, image=db_image, owner="service", target_ids=service_ids)
    _sync_image_links_for_owner(
        db,
        image=db_image,
        owner="treatment_plan",
        target_ids=treatment_plan_ids,
    )

    db.commit()
    return _get_image_by_id(db, db_image.id)


def list_images(
    db: Session,
    *,
    product_id: Optional[uuid.UUID] = None,
    service_id: Optional[uuid.UUID] = None,
    treatment_plan_id: Optional[uuid.UUID] = None,
) -> List[Image]:
    """Lấy danh sách hình ảnh, có thể lọc theo đối tượng sở hữu."""

    statement = _image_query_base()

    if product_id is not None:
        statement = statement.join(ProductImageLink).where(
            ProductImageLink.product_id == product_id
        )
    if service_id is not None:
        statement = statement.join(ServiceImageLink).where(
            ServiceImageLink.service_id == service_id
        )
    if treatment_plan_id is not None:
        statement = statement.join(TreatmentPlanImageLink).where(
            TreatmentPlanImageLink.treatment_plan_id == treatment_plan_id
        )

    return db.exec(statement).unique().all()


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

    entity_id = getattr(entity, "id", None)
    if entity_id is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Đối tượng chưa được lưu nên không thể đồng bộ hình ảnh.",
        )

    current_images = [image for image in getattr(entity, "images", []) if not image.is_deleted]

    if existing_image_ids is None:
        ordered_existing_ids: List[uuid.UUID] = [image.id for image in current_images]
    else:
        ordered_existing_ids = list(dict.fromkeys(existing_image_ids))

    keep_ids = set(ordered_existing_ids)
    for image in current_images:
        if image.id not in keep_ids:
            _unlink_image(db, owner=owner, entity_id=entity_id, image_id=image.id)

    ordered_images: List[Image] = []
    previous_primary_id: Optional[uuid.UUID] = getattr(entity, "primary_image_id", None)

    for image_id in ordered_existing_ids:
        image = _get_image_by_id(db, image_id)
        _link_image(db, owner=owner, entity_id=entity_id, image_id=image.id)
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
        db.add(db_image)
        db.flush()
        _link_image(db, owner=owner, entity_id=entity_id, image_id=db_image.id)
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
