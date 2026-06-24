import enum
from sqlalchemy import (
    Column, String, Integer, Text, Date, Enum, ForeignKey, BigInteger, DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


# Enums 

class RoomType(str, enum.Enum):
    DORM = "DORM"                # Phòng ở sinh viên
    STUDY = "STUDY"              # Phòng học
    CANTEEN = "CANTEEN"          # Nhà ăn

    COMMON = "COMMON"            # Phòng sinh hoạt chung
    GUEST = "GUEST"              # Phòng khách / tiếp khách
    SUPERVISOR = "SUPERVISOR"    # Phòng quản sinh

    OTHER = "OTHER"              # Khác

class Gender(str, enum.Enum):
    MALE   = "MALE"
    FEMALE = "FEMALE"

class UserRole(str, enum.Enum):
    ADMIN   = "admin"
    MANAGER = "manager"


# Tables

class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)
    
    floors = relationship("Floor", back_populates="building", cascade="all, delete-orphan")


class Floor(Base):
    __tablename__ = "floors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), nullable=False)
    number      = Column(Integer, nullable=False)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)

    building = relationship("Building", back_populates="floors")
    rooms    = relationship("Room", back_populates="floor", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    floor_id = Column(Integer, ForeignKey("floors.id", ondelete="CASCADE"), nullable=False)
    # Example for room code: "NT1-T2-P204" (Building NT1, Floor 2, Room 204)
    code    = Column(String(50), unique=True, nullable=False)
    # Example for room label: "204" (Room 204)
    label     = Column(String(20), unique=True, nullable=False)
    type     = Column(Enum(RoomType), nullable=False, default=RoomType.DORM)
    capacity = Column(Integer, default=6)

    floor    = relationship("Floor", back_populates="rooms")
    students = relationship("Student", back_populates="room")


class Student(Base):
    __tablename__ = "students"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    full_name       = Column(String(100))
    gender          = Column(Enum(Gender))
    hometown        = Column(String(100))
    class_name      = Column(String(20))
    phone           = Column(String(20))
    parent_phone    = Column(String(20))
    note            = Column(Text)
    room_id         = Column(Integer, ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)

    room       = relationship("Room", back_populates="students")
    violations = relationship("Violation", back_populates="student", cascade="all, delete-orphan")


class Violation(Base):
    __tablename__ = "violations"

    id             = Column(Integer, primary_key=True, autoincrement=True)
    student_id     = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    title          = Column(String(255), nullable=False)
    description    = Column(Text)
    violation_date = Column(Date, nullable=False)

    student = relationship("Student", back_populates="violations")


class User(Base):
    """Internal accounts for manager/admin roles."""
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, autoincrement=True)
    username   = Column(String(50), unique=True, nullable=False)
    hashed_pw  = Column(String(255), nullable=False)
    role       = Column(Enum(UserRole), nullable=False, default=UserRole.MANAGER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())