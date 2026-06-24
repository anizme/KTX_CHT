from app.models.models import Student
from app.schemas.schemas import (
    StudentOut, StudentDetail,
)

def to_student_out(student: Student) -> StudentOut:
    return StudentOut(
        id=student.id,
        full_name=student.full_name,
        gender=student.gender,
        hometown=student.hometown,
        class_name=student.class_name,

        room_label=(
            student.room.label
            if student.room
            else None
        ),

        floor_number=(
            student.room.floor.number
            if student.room
            else None
        ),

        building_code=(
            student.room.floor.building.code
            if student.room
            else None
        ),

        violation_count=len(student.violations),
    )

def to_student_detail(student: Student) -> StudentDetail:
    return StudentDetail(
        id=student.id,
        full_name=student.full_name,
        gender=student.gender,
        hometown=student.hometown,
        class_name=student.class_name,

        phone=student.phone,
        parent_phone=student.parent_phone,
        note=student.note,

        room_label=(
            student.room.label
            if student.room
            else None
        ),

        floor_number=(
            student.room.floor.number
            if student.room
            else None
        ),

        building_code=(
            student.room.floor.building.code
            if student.room
            else None
        ),

        violation_count=len(student.violations),

        violations=student.violations,
    )