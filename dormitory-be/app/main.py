"""
Dormitory Management System – FastAPI Backend
=============================================
Roles:
  anonymous  – GET /overview, /buildings, /floors, /rooms, /students/public
  manager    – Full CRUD on buildings / floors / rooms / students / violations
  admin      – All manager rights + user account management (/users)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.database import engine
from app.models import models

# Create all tables
models.Base.metadata.create_all(bind=engine)

# Routers
from app.routers import (
    auth, users, buildings, floors, rooms, students, violations, overview
)
from app.core.security import hash_password
from app.models.database import SessionLocal
from app.models.models import User, UserRole


app = FastAPI(
    title="Dormitory Management API",
    description="Hệ thống quản lý ký túc xá",
    version="1.0.0",
)

# CORS (adjust origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(overview.router)
app.include_router(buildings.router)
app.include_router(floors.router)
app.include_router(rooms.router)
app.include_router(students.router)
app.include_router(violations.router)


# Seed default admin on first run

def seed_admin():
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.username == "admin").first():
            admin = User(
                username="admin",
                hashed_pw=hash_password("admin123"),
                role=UserRole.ADMIN,
            )
            db.add(admin)
            db.commit()
            print("✅  Tài khoản admin mặc định đã được tạo  (username=admin / password=admin123)")
    finally:
        db.close()

seed_admin()


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Dormitory Management API",
        "docs": "/docs",
        "redoc": "/redoc",
    }