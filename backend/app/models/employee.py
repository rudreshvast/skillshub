from datetime import datetime
from sqlalchemy import Column, String, Date, Boolean, DateTime, ForeignKey, Integer
from app.db.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    date_of_joining = Column(Date, nullable=False)
    designation = Column(String, nullable=False)
    department = Column(String, nullable=False)
    location = Column(String, nullable=False)
    work_mode = Column(String, nullable=False)
    seniority = Column(String, nullable=False, default="mid")
    profile_complete = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
