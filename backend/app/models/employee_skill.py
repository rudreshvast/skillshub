from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class EmployeeSkill(Base):
    __tablename__ = "employee_skills"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    skill_name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # language, framework, platform, tool, domain
    proficiency = Column(String, nullable=False)  # novice, intermediate, expert
    years = Column(Integer, nullable=True)
    is_inferred = Column(Boolean, default=False)
    confidence_score = Column(Float, nullable=True)

    employee = relationship("Employee", backref="skills")
