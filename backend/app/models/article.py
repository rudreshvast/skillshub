from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, ARRAY
from sqlalchemy.sql import func
from app.db.database import Base


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)          # Tiptap HTML
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="draft")        # draft | pending_review | published | rejected
    is_recommended = Column(Boolean, default=False)
    tags = Column(ARRAY(String), nullable=True)     # tech tags e.g. ["React", "Python"]
    department_tags = Column(ARRAY(String), nullable=True)  # dept tags e.g. ["Engineering", "Design"]
    rejection_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    published_at = Column(DateTime, nullable=True)
