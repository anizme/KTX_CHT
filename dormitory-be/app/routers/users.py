from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.database import get_db
from app.models.models import User
from ..schemas.schemas import UserCreate, UserOut, UserChangePassword
from ..core.security import (
    hash_password, verify_password,
    require_admin, get_current_user
)

router = APIRouter(prefix="/users", tags=["Users (admin)"])


@router.get("", response_model=List[UserOut], summary="Danh sách tài khoản")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(User).all()


@router.post("", response_model=UserOut, status_code=201, summary="Tạo tài khoản mới")
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại")
    user = User(
        username=payload.username,
        hashed_pw=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204, summary="Xoá tài khoản")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Không thể xoá chính mình")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản")
    db.delete(user)
    db.commit()


@router.patch("/{user_id}/role", response_model=UserOut, summary="Đổi role tài khoản")
def change_role(
    user_id: int,
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    from app.models.models import UserRole
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail=f"Role không hợp lệ: {role}")
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Không thể đổi role của chính mình")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản")
    user.role = UserRole(role)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/me/password", status_code=204, summary="Đổi mật khẩu bản thân")
def change_own_password(
    payload: UserChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.old_password, current_user.hashed_pw):
        raise HTTPException(status_code=400, detail="Mật khẩu cũ không đúng")
    current_user.hashed_pw = hash_password(payload.new_password)
    db.commit()