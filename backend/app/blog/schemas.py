from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ArticleCreate(BaseModel):
    title: str
    content: str                          # Tiptap HTML
    tags: Optional[list[str]] = None
    department_tags: Optional[list[str]] = None


class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[list[str]] = None
    department_tags: Optional[list[str]] = None


class ArticleListItem(BaseModel):
    id: int
    title: str
    status: str
    is_recommended: bool
    tags: Optional[list[str]]
    department_tags: Optional[list[str]]
    author_id: int
    author_name: Optional[str] = None
    author_designation: Optional[str] = None
    author_department: Optional[str] = None
    author_employee_id: Optional[int] = None
    excerpt: Optional[str] = None
    created_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ArticleResponse(ArticleListItem):
    content: str
    rejection_feedback: Optional[str] = None
    updated_at: Optional[datetime] = None


class TaskCreate(BaseModel):
    description: str


class TaskResponse(BaseModel):
    id: int
    article_id: int
    description: str
    created_by: int
    completion_count: int = 0
    completed_by_me: bool = False

    class Config:
        from_attributes = True


class ArticleDetailResponse(ArticleResponse):
    tasks: list[TaskResponse] = []


class RejectRequest(BaseModel):
    feedback: Optional[str] = None


class TaskCompletionInfo(BaseModel):
    employee_id: int
    employee_name: str
    completed_at: datetime
