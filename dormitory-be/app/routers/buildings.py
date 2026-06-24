from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.database import get_db
from app.models.models import Building, User
from app.schemas.schemas import BuildingCreate, BuildingOut, BuildingDetail
from app.core.security import require_manager

router = APIRouter(prefix="/buildings", tags=["Buildings"])


# PUBLIC (anonymous)

@router.get("", response_model=List[BuildingOut], summary="Danh sách tòa (public)")
def list_buildings(db: Session = Depends(get_db)):
    return db.query(Building).all()


@router.get("/{building_id}", response_model=BuildingDetail, summary="Chi tiết tòa (public)")
def get_building(building_id: str, db: Session = Depends(get_db)):
    b = (
        db.query(Building)
        .options(joinedload(Building.floors))
        .filter(Building.id == building_id)
        .first()
    )
    if not b:
        raise HTTPException(status_code=404, detail="Không tìm thấy tòa nhà")
    return b


# MANAGER / ADMIN

@router.post("", response_model=BuildingOut, status_code=201, summary="Thêm tòa (manager+)")
def create_building(
    payload: BuildingCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    b = Building(
        code=payload.code,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


@router.delete("/{building_id}", status_code=204, summary="Xoá tòa (manager+)")
def delete_building(
    building_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    b = db.query(Building).filter(Building.id == building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Không tìm thấy tòa nhà")
    db.delete(b)
    db.commit()