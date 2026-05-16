from datetime import datetime
from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, DateTime, ARRAY, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    client = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    tech_stack = Column(ARRAY(String), nullable=True)
    links = Column(JSON, nullable=True)
    status = Column(String, default="active")
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    allocations = relationship("ProjectAllocation", back_populates="project", cascade="all, delete-orphan")


class ProjectAllocation(Base):
    __tablename__ = "project_allocations"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    allocation_percentage = Column(Integer, nullable=False)  # 1-100
    role_in_project = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="allocations")
