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

    OFFICE = "OFFICE"            # Phòng hành chính

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

    @property
    def occupancy(self):
        return sum(floor.occupancy for floor in self.floors)
    
    @property
    def available_slots(self):
        """Return the number of available slots in this building."""
        return sum(floor.available_slots for floor in self.floors)
    
    @property
    def dorm_rooms(self):
        """Return a list of rooms that are of type DORM."""
        return [room for floor in self.floors for room in floor.dorm_rooms]
    
    @property
    def total_dorm_rooms(self):
        """Return the number of rooms that are of type DORM."""
        return len(self.dorm_rooms)


class Floor(Base):
    __tablename__ = "floors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    number      = Column(Integer, nullable=False)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)

    building = relationship("Building", back_populates="floors")
    rooms    = relationship("Room", back_populates="floor", cascade="all, delete-orphan")

    @property
    def code(self):
        """Example for floor code: "NT1-T2" (Building NT1, Floor 2)"""
        return f"{self.building.code}-T{self.number}"
    
    @property
    def occupancy(self):
        return sum(room.occupancy for room in self.rooms)
    
    @property
    def available_slots(self):
        """Return the number of available slots in this floor."""
        return sum(room.available_slots for room in self.rooms)
    
    @property
    def dorm_rooms(self):
        """Return a list of rooms that are of type DORM."""
        return [room for room in self.rooms if room.type == RoomType.DORM]
    
    @property
    def total_dorm_rooms(self):
        """Return the number of rooms that are of type DORM."""
        return len(self.dorm_rooms)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    floor_id = Column(Integer, ForeignKey("floors.id", ondelete="CASCADE"), nullable=False)
    label    = Column(String(20), unique=True, nullable=False)
    type     = Column(Enum(RoomType), nullable=False, default=RoomType.DORM)
    capacity = Column(Integer, default=6)

    floor    = relationship("Floor", back_populates="rooms")
    students = relationship("Student", back_populates="room")

    @property
    def code(self):
        """Example for room code: "NT1-T2-P204" (Building NT1, Floor 2, Room 204)"""
        return f"{self.floor.code}-P{self.label}"
    
    @property
    def occupancy(self):
        """Return the number of students currently in this room."""
        return len(self.students)
    
    @property
    def available_slots(self):
        """Return the number of available slots in this room."""
        return self.capacity - self.occupancy


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

    @property
    def room_label(self):
        return self.room.label if self.room else None
    
    @property
    def floor_number(self):
        return self.room.floor.number if self.room else None
    
    @property
    def building_code(self):
        return self.room.floor.building.code if self.room else None
    
    @property
    def violation_count(self):
        return len(self.violations) 


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