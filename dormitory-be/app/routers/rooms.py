from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.models.database import get_db
from app.models.models import Room, Floor, User, RoomType
from app.schemas.schemas import RoomCreate, RoomUpdate, RoomOut, RoomDetail
from app.core.security import require_manager
from app.core.code_gen import room_code as make_room_code

router = APIRouter(prefix="/rooms", tags=["Rooms"])


# PUBLIC

@router.get("", response_model=List[RoomOut], summary="Danh sách phòng (public)")
def list_rooms(
    floor_id: Optional[int] = None,
    type: Optional[RoomType] = RoomType.DORM,
    db: Session = Depends(get_db),
):
    q = db.query(Room)
    if floor_id:
        q = q.filter(Room.floor_id == floor_id)
    if type:
        q = q.filter(Room.type == type)
    return q.all()


@router.get("/{room_id}", response_model=RoomDetail, summary="Chi tiết phòng (public)")
def get_room(room_id: str, db: Session = Depends(get_db)):
    r = (
        db.query(Room)
        .options(joinedload(Room.students))
        .filter(Room.id == room_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
    return r


# MANAGER / ADMIN

@router.post("", response_model=RoomOut, status_code=201, summary="Thêm phòng (manager+)")
def create_room(
    payload: RoomCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    f = db.query(Floor).filter(Floor.id == payload.floor_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Không tìm thấy tầng")
    rc = make_room_code(f.code, payload.label)
    if db.query(Room).filter(Room.code == rc).first():
        raise HTTPException(status_code=400, detail=f"Phòng {payload.label} ở tầng {f.number} của tòa {f.building.code} đã tồn tại")
    room = Room(
        code=rc,
        label=payload.label,
        floor_id=payload.floor_id,
        type=payload.type,
        capacity=payload.capacity,
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.patch("/{room_id}", response_model=RoomOut, summary="Cập nhật phòng (manager+)")
def update_room(
    room_id: str,
    payload: RoomUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(room, field, val)
    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}", status_code=204, summary="Xoá phòng (manager+)")
def delete_room(
    room_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
    db.delete(room)
    db.commit()