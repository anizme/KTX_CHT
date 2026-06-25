from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel

from app.models.models import Gender, RoomType, UserRole


# =========================================================
# AUTH
# =========================================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# =========================================================
# USER
# =========================================================

class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.MANAGER


class UserOut(BaseModel):
    id: int
    username: str
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class UserChangePassword(BaseModel):
    old_password: str
    new_password: str


# =========================================================
# VIOLATION
# =========================================================

class ViolationCreate(BaseModel):
    student_id: int
    title: str
    description: Optional[str] = None
    violation_date: date


class ViolationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    violation_date: Optional[date] = None


# Manager/Admin view
class ViolationOut(BaseModel):
    id: int
    student_id: int
    title: str
    description: Optional[str]
    violation_date: date

    model_config = {"from_attributes": True}


# =========================================================
# STUDENT
# =========================================================

class StudentCreate(BaseModel):
    full_name:str
    gender: Gender
    hometown: Optional[str] = None
    class_name: Optional[str] = None
    phone: str
    parent_phone: Optional[str] = None
    note: Optional[str] = None
    room_id: Optional[int] = None


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[Gender] = None
    hometown: Optional[str] = None
    class_name: Optional[str] = None
    phone: Optional[str] = None
    parent_phone: Optional[str] = None
    note: Optional[str] = None
    room_id: Optional[int] = None


# STUDENT VIEWS

# PUBLIC (anonymous)
class StudentOut(BaseModel):
    id: int
    full_name: Optional[str]
    gender: Optional[Gender]
    hometown: Optional[str]
    class_name: Optional[str]
    room_id: Optional[int]
    room_label: Optional[str]
    floor_number: Optional[int]
    building_code: Optional[str]
    violation_count: int = 0

    model_config = {"from_attributes": True}

# ADMIN (full detail)
class StudentDetail(BaseModel):
    id: int
    full_name: Optional[str]
    gender: Optional[Gender]
    hometown: Optional[str]
    class_name: Optional[str]

    phone: Optional[str]
    parent_phone: Optional[str]

    note: Optional[str]

    room_id: Optional[int]
    room_label: Optional[str]

    floor_id: Optional[int]
    floor_number: Optional[int]

    building_id: Optional[int]
    building_code: Optional[str]

    violation_count: int
    violations: List[ViolationOut] = []

    model_config = {"from_attributes": True}


# =========================================================
# ROOM
# =========================================================

class RoomCreate(BaseModel):
    floor_id: int
    label: str
    type: RoomType = RoomType.DORM
    capacity: int = 6


class RoomUpdate(BaseModel):
    label: Optional[str] = None
    type: Optional[RoomType] = None
    capacity: Optional[int] = None


class RoomOut(BaseModel):
    id: int
    floor_id: int
    label: str
    code: str
    type: RoomType
    capacity: int
    available_slots: int

    model_config = {"from_attributes": True}


# PUBLIC ROOM DETAIL (tree view)
class RoomDetail(RoomOut):
    students: List[StudentOut] = []


# =========================================================
# FLOOR
# =========================================================

class FloorCreate(BaseModel):
    building_id: int
    number: int


class FloorOut(BaseModel):
    id: int
    building_id: int
    number: int
    code: str
    occupancy: int
    available_slots: int

    model_config = {"from_attributes": True}


class FloorDetail(FloorOut):
    rooms: List[RoomDetail] = []


# BUILDING

class BuildingCreate(BaseModel):
    code: str


class BuildingOut(BaseModel):
    id: int
    code: str
    occupancy: int
    available_slots: int

    model_config = {"from_attributes": True}


class BuildingDetail(BuildingOut):
    floors: List[FloorDetail] = []


# STATS

class OverviewStats(BaseModel):
    buildings: List[BuildingDetail]

    total_buildings: int
    total_dorm_rooms: int
    total_occupancy: int
    available_slots: int