from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class EmployeeCertification(Base):
    __tablename__ = "employee_certifications"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    issuer = Column(String, nullable=True)
    issued_on = Column(Date, nullable=True)

    employee = relationship("Employee", backref="certifications")
