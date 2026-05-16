from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.db.database import Base


class TaskCompletion(Base):
    __tablename__ = "task_completions"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("article_tasks.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    completed_at = Column(DateTime, default=func.now())

    __table_args__ = (
        UniqueConstraint("task_id", "employee_id", name="uq_task_employee"),
    )
