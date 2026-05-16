from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.auth.dependencies import get_db, get_current_user, require_hr_or_management
from app.models.employee import Employee
from app.models.user import User
from app.blog import service
from app.blog.schemas import (
    ArticleCreate, ArticleUpdate, ArticleDetailResponse,
    ArticleListItem, TaskCreate, RejectRequest
)

router = APIRouter()


def _get_employee(db: Session, user: User):
    return db.query(Employee).filter(Employee.user_id == user.id).first()


# ── Feed & filters ─────────────────────────────────────────────

@router.get("/tags")
def get_tags(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return service.get_all_tags(db)


@router.get("")
def list_articles(
    tag: Optional[str] = None,
    department_tag: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = _get_employee(db, current_user)
    employee_id = employee.id if employee else None
    return service.list_articles(
        db, status="published",
        tag=tag, department_tag=department_tag,
        search=search, page=page, page_size=page_size,
        current_employee_id=employee_id
    )


# ── Article CRUD ───────────────────────────────────────────────

@router.post("", status_code=201)
def create_article(
    data: ArticleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.create_article(db, data.model_dump(), author_id=current_user.id)


@router.get("/my-articles")
def my_articles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.article import Article
    articles = db.query(Article).filter(
        Article.author_id == current_user.id
    ).order_by(Article.updated_at.desc()).all()
    return articles


@router.get("/pending")
def pending_articles(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    return service.list_articles(db, status="pending_review", page_size=100)


@router.get("/{article_id}")
def get_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = _get_employee(db, current_user)
    result = service.get_article(db, article_id, current_employee_id=employee.id if employee else None)
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    return result


@router.put("/{article_id}")
def update_article(
    article_id: int,
    data: ArticleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = service.update_article(db, article_id, data.model_dump(exclude_none=True), current_user.id)
        if not result:
            raise HTTPException(status_code=404, detail="Article not found")
        return result
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not the author")


@router.delete("/{article_id}", status_code=204)
def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.article import Article
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if article.author_id != current_user.id and current_user.role != "hr":
        raise HTTPException(status_code=403, detail="Not allowed")
    service.delete_article(db, article_id)


# ── Review actions (HR only) ───────────────────────────────────

@router.post("/{article_id}/submit")
def submit_for_review(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = service.submit_for_review(db, article_id, current_user.id)
        if not result:
            raise HTTPException(status_code=404, detail="Article not found")
        return result
    except PermissionError:
        raise HTTPException(status_code=403, detail="Not the author")


@router.post("/{article_id}/approve")
def approve_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    result = service.approve_article(db, article_id)
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    return result


@router.post("/{article_id}/reject")
def reject_article(
    article_id: int,
    data: RejectRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    result = service.reject_article(db, article_id, data.feedback)
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    return result


@router.post("/{article_id}/recommend")
def set_recommended(
    article_id: int,
    value: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = _get_employee(db, current_user)
    if not service.can_recommend(current_user, employee):
        raise HTTPException(status_code=403, detail="Not authorized to recommend articles")
    result = service.toggle_recommended(db, article_id, value)
    if not result:
        raise HTTPException(status_code=404, detail="Article not found")
    return result


# ── Tasks ──────────────────────────────────────────────────────

@router.post("/{article_id}/tasks", status_code=201)
def add_task(
    article_id: int,
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.add_task(db, article_id, data.description, current_user.id)


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service.delete_task(db, task_id)


@router.post("/tasks/{task_id}/complete")
def toggle_completion(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = _get_employee(db, current_user)
    if not employee:
        raise HTTPException(status_code=400, detail="Employee profile not found")
    completed = service.toggle_task_completion(db, task_id, employee.id)
    return {"completed": completed}


@router.get("/tasks/{task_id}/completions")
def task_completions(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_task_completions(db, task_id)


@router.get("/tasks/mine/pending")
def my_pending_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = _get_employee(db, current_user)
    if not employee:
        return []
    return service.get_my_pending_tasks(db, employee.id)
