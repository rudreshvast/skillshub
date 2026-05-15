from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY
from sqlalchemy.orm import relationship

from app.db.database import Base


class EmployeeProject(Base):
    __tablename__ = "employee_projects"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    domain = Column(String, nullable=True)
    technologies = Column(ARRAY(String), nullable=True)

    employee = relationship("Employee", backref="projects")
