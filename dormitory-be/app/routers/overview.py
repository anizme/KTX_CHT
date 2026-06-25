from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.models.database import get_db
from app.models.models import Building, Floor, Room
from ..schemas.schemas import OverviewStats

router = APIRouter(prefix="/overview", tags=["Overview (public)"])


@router.get(
    "",
    response_model=OverviewStats,
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

    total_buildings = len(buildings)

    total_dorm_rooms = sum(
        building.total_dorm_rooms
        for building in buildings
    )

    total_occupancy = sum(
        building.occupancy
        for building in buildings
    )

    available_slots = sum(
        building.available_slots
        for building in buildings
    )

    return OverviewStats(
        buildings=buildings,

        total_buildings=total_buildings,
        total_dorm_rooms=total_dorm_rooms,
        total_occupancy=total_occupancy,
        available_slots=available_slots,
    )