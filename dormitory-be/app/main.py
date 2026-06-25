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

import json
from pathlib import Path

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
from app.models.models import (
    User, UserRole,
    Building,
    Floor,
    Room,
    RoomType,
)

app = FastAPI(
    title="Dormitory Management API",
    description="Hệ thống quản lý ký túc xá",
    version="1.0.0",
)

# CORS (adjust origins in production)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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

def seed_architecture():
    db = SessionLocal()
    try:
        # Nếu đã có dữ liệu thì bỏ qua
        if db.query(Building).first():
            return

        json_path = (
            Path(__file__).parent.parent
            / ".data"
            / "buildings.json"
        )

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for building_data in data["buildings"]:

            building = Building(
                code=building_data["code"]
            )

            db.add(building)
            db.flush()  # lấy building.id

            for floor_data in building_data["floors"]:

                floor = Floor(
                    number=floor_data["number"],
                    building_id=building.id,
                )

                db.add(floor)
                db.flush()

                for room_data in floor_data["rooms"]:
                    room = Room(
                        floor_id=floor.id,
                        label=room_data["label"],
                        type=RoomType(room_data["type"]),
                        capacity=room_data["capacity"],
                    )

                    db.add(room)
                    db.commit()
        print("✅ Architecture seeded")
    finally:
        db.close()



def seed_students():
    db = SessionLocal()
    try:
        # Nếu đã có dữ liệu thì bỏ qua
        if db.query(models.Student).first():
            return

        json_path = (
            Path(__file__).parent.parent
            / ".data"
            / "students.json"
        )

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for student_data in data["students"]:
            room_label = student_data["room_label"]
            room = db.query(models.Room).filter(models.Room.label == room_label).first()
            if not room:
                print(f"⚠️  Room with label '{room_label}' not found for student '{student_data['full_name']}'")
                continue
            student = models.Student(
                full_name=student_data["full_name"],
                gender=student_data["gender"],
                hometown=student_data["hometown"],
                class_name=student_data["class"],
                phone=student_data["phone"],
                parent_phone=student_data["parent_phone"],
                note=student_data["note"],
                room_id=room.id,
            )
            db.add(student)
            db.commit()
        print("✅ Students seeded")
    finally:
        db.close()


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

seed_architecture()
seed_students()
seed_admin()


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Dormitory Management API",
        "docs": "/docs",
        "redoc": "/redoc",
    }