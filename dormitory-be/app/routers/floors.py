from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.database import get_db
from app.models.models import Floor, Building, User
from app.schemas.schemas import FloorCreate, FloorOut, FloorDetail
from app.core.security import require_manager

router = APIRouter(prefix="/floors", tags=["Floors"])


# PUBLIC

@router.get("", response_model=List[FloorOut], summary="Danh sách tầng (public)")
def list_floors(building_id: str | None = None, db: Session = Depends(get_db)):
    q = db.query(Floor)
    if building_id:
        q = q.filter(Floor.building_id == building_id)
    return q.all()


@router.get("/{floor_id}", response_model=FloorDetail, summary="Chi tiết tầng (public)")
def get_floor(floor_id: str, db: Session = Depends(get_db)):
    f = (
        db.query(Floor)
        .options(joinedload(Floor.rooms))
        .filter(Floor.id == floor_id)
        .first()
    )
    if not f:
        raise HTTPException(status_code=404, detail="Không tìm thấy tầng")
    return f


# MANAGER / ADMIN

@router.post("", response_model=FloorOut, status_code=201, summary="Thêm tầng (manager+)")
def create_floor(
    payload: FloorCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    b = db.query(Building).filter(Building.id == payload.building_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Không tìm thấy tòa nhà")
    if payload.number < 1:
        raise HTTPException(status_code=400, detail="Số tầng phải là số nguyên dương")
    if any(f.number == payload.number for f in b.floors):
        raise HTTPException(
            status_code=400,
            detail=f"Tòa {b.label} đã có tầng {payload.number}"
        )
    
    f = Floor(building_id=payload.building_id, number=payload.number)
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.delete("/{floor_id}", status_code=204, summary="Xoá tầng (manager+)")
def delete_floor(
    floor_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    f = db.query(Floor).filter(Floor.id == floor_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Không tìm thấy tầng")
    db.delete(f)
    db.commit()