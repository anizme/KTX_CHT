from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.models.database import get_db
from app.models.models import Building, Floor, Room, Student
from ..schemas.schemas import BuildingDetail

router = APIRouter(prefix="/overview", tags=["Overview (public)"])


@router.get(
    "",
    response_model=List[BuildingDetail],
    summary="Tổng quan ký túc xá: tòa → tầng → phòng → sinh viên (public)",
)
def get_overview(db: Session = Depends(get_db)):
    buildings = (
        db.query(Building)
        .options(
            joinedload(Building.floors)
                .joinedload(Floor.rooms)
                .joinedload(Room.students)
        )
        .order_by(Building.id)
        .all()
    )

    return buildings