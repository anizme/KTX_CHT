from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import Violation, Student, User
from ..schemas.schemas import ViolationCreate, ViolationUpdate, ViolationOut
from ..core.security import require_manager

router = APIRouter(prefix="/violations", tags=["Violations"])


@router.get("", response_model=List[ViolationOut], summary="Danh sách vi phạm (manager+)")
def list_violations(
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    q = db.query(Violation)
    if student_id:
        q = q.filter(Violation.student_id == student_id)
    return q.order_by(Violation.violation_date.desc()).all()


@router.get("/{violation_id}", response_model=ViolationOut, summary="Chi tiết vi phạm (manager+)")
def get_violation(
    violation_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Không tìm thấy vi phạm")
    return v


@router.post("", response_model=ViolationOut, status_code=201, summary="Thêm vi phạm (manager+)")
def create_violation(
    payload: ViolationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Không tìm thấy học sinh")
    v = Violation(**payload.model_dump())
    db.add(v)
    # increment counter
    db.commit()
    db.refresh(v)
    return v


@router.patch("/{violation_id}", response_model=ViolationOut, summary="Cập nhật vi phạm (manager+)")
def update_violation(
    violation_id: int,
    payload: ViolationUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Không tìm thấy vi phạm")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(v, field, val)
    db.commit()
    db.refresh(v)
    return v


@router.delete("/{violation_id}", status_code=204, summary="Xoá vi phạm (manager+)")
def delete_violation(
    violation_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_manager),
):
    v = db.query(Violation).filter(Violation.id == violation_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Không tìm thấy vi phạm")
    student = db.query(Student).filter(Student.id == v.student_id).first()
    db.delete(v)
    db.commit()