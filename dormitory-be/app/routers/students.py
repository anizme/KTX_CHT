from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.models.database import get_db
from app.models.models import Student, Room, User, Gender, Floor
from app.schemas.schemas import (
    StudentCreate, StudentUpdate,
    StudentOut, StudentDetail,
)

from app.core.security import require_manager

router = APIRouter(prefix="/students", tags=["Students"])


# PUBLIC

@router.get("/public", response_model=List[StudentOut], summary="Danh sách sinh viên (public - ẩn thông tin nhạy cảm)")
def list_students_public(
    room_id: Optional[int] = None,
    gender: Optional[Gender] = None,
    class_name: Optional[str] = None,
    hometown: Optional[str] = None,
    building_id: Optional[int] = None,
    floor_number: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = (
        db.query(Student)
        .options(
            joinedload(Student.room)
            .joinedload(Room.floor)
            .joinedload(Floor.building),

            joinedload(Student.violations)
        )
    )

    if room_id is not None:
        q = q.filter(Student.room_id == room_id)

    if gender is not None:
        q = q.filter(Student.gender == gender)

    if class_name:
        q = q.filter(
            Student.class_name.ilike(f"%{class_name}%")
        )

    if hometown:
        q = q.filter(
            Student.hometown.ilike(f"%{hometown}%")
        )

    if building_id is not None:
        q = (
            q.join(Student.room)
            .join(Room.floor)
            .filter(Floor.building_id == building_id)
        )

    if floor_number is not None:
        if building_id is None:
            raise HTTPException(
                status_code=400,
                detail="building_id is required when filtering by floor"
            )

        q = q.filter(Floor.number == floor_number)

    return q.all()


# MANAGER / ADMIN

@router.get("/{student_id}", response_model=StudentDetail, summary="Chi tiết sinh viên (manager+)")
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    s = (
        db.query(Student)
        .options(joinedload(Student.violations))
        .filter(Student.id == student_id)
        .first()
    )
    if not s:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
    return s


@router.post("", response_model=StudentOut, status_code=201, summary="Thêm sinh viên (manager+)")
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    if db.query(Student).filter(Student.phone == payload.phone).first():
        raise HTTPException(status_code=400, detail=f"Sinh viên với số điện thoại {payload.phone} đã tồn tại")
    if payload.room_id:
        room = db.query(Room).filter(Room.id == payload.room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        occupied = db.query(Student).filter(Student.room_id == payload.room_id).count()
        if occupied >= room.capacity:
            raise HTTPException(status_code=400, detail="Phòng đã đầy")
        if room.students:
            if room.students[0].gender != payload.gender:
                raise HTTPException(
                    status_code=400,
                    detail="Phòng không phù hợp với giới tính sinh viên"
                )
        
    student = Student(
        full_name=payload.full_name,
        gender=payload.gender,
        hometown=payload.hometown,
        class_name=payload.class_name,
        phone=payload.phone,
        parent_phone=payload.parent_phone,
        note=payload.note,
        room_id=payload.room_id,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.patch("/{student_id}", response_model=StudentDetail, summary="Cập nhật sinh viên (manager+)")
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")

    # Validate room change
    new_room_id = payload.room_id
    if new_room_id is not None and new_room_id != student.room_id:
        room = db.query(Room).filter(Room.id == new_room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        occupied = db.query(Student).filter(
            Student.room_id == new_room_id,
            Student.id != student_id,
        ).count()
        if occupied >= room.capacity:
            raise HTTPException(status_code=400, detail="Phòng đã đầy")

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, val)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=204, summary="Xoá sinh viên (manager+)")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
    db.delete(student)
    db.commit()


@router.post("/{student_id}/assign-room", response_model=StudentOut, summary="Xếp phòng sinh viên (manager+)")
def assign_room(
    student_id: int,
    room_id: Optional[int] = Query(None, description="Để trống để huỷ xếp phòng"),
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy sinh viên")
    if room_id:
        room = db.query(Room).filter(Room.id == room_id).first()
        if not room:
            raise HTTPException(status_code=404, detail="Không tìm thấy phòng")
        occupied = db.query(Student).filter(
            Student.room_id == room_id, Student.id != student_id
        ).count()
        if occupied >= room.capacity:
            raise HTTPException(status_code=400, detail="Phòng đã đầy")
    student.room_id = room_id or None
    db.commit()
    db.refresh(student)
    return student