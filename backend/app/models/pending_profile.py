from datetime import datetime
from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class PendingProfile(Base):
    __tablename__ = "pending_profiles"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False, index=True)
    extracted_data = Column(JSON, nullable=False)
    original_pdf_path = Column(String, nullable=False)
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    employee = relationship("Employee", backref="pending_profiles")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
