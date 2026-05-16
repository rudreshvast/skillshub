from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.article import Article
from app.models.article_task import ArticleTask
from app.models.task_completion import TaskCompletion
from app.models.user import User
from app.models.employee import Employee
import re


SENIOR_DESIGNATIONS = {"CTO", "Architect", "Delivery Head", "Principal", "Tech Lead"}


def can_recommend(user, employee) -> bool:
    """HR role or senior designation can mark as recommended."""
    if user.role == "hr":
        return True
    if employee and employee.designation in SENIOR_DESIGNATIONS:
        return True
    return False


def _strip_html(html: str) -> str:
    """Strip HTML tags for excerpt generation."""
    clean = re.sub(r'<[^>]+>', ' ', html or '')
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean[:200]


def _enrich_article(article, author_user, author_employee):
    """Build a dict with joined author info and excerpt."""
    d = {c.name: getattr(article, c.name) for c in article.__table__.columns}
    d["author_name"] = author_user.name if author_user else None
    d["author_designation"] = author_employee.designation if author_employee else None
    d["author_department"] = author_employee.department if author_employee else None
    d["author_employee_id"] = author_employee.id if author_employee else None
    d["excerpt"] = _strip_html(article.content)
    return d


# ── Article CRUD ───────────────────────────────────────────────

def list_articles(
    db: Session,
    status: str = "published",
    tag: str = None,
    department_tag: str = None,
    search: str = None,
    page: int = 1,
    page_size: int = 20,
    current_employee_id: int = None
):
    query = db.query(Article).filter(Article.status == status)

    if tag:
        query = query.filter(Article.tags.contains([tag]))
    if department_tag:
        query = query.filter(Article.department_tags.contains([department_tag]))
    if search:
        query = query.filter(Article.title.ilike(f"%{search}%"))

    # Recommended first, then by published_at desc
    query = query.order_by(
        Article.is_recommended.desc(),
        Article.published_at.desc()
    )

    total = query.count()
    articles = query.offset((page - 1) * page_size).limit(page_size).all()

    result = []
    for article in articles:
        author_user = db.query(User).filter(User.id == article.author_id).first()
        author_employee = db.query(Employee).filter(Employee.user_id == article.author_id).first()
        result.append(_enrich_article(article, author_user, author_employee))

    return {"items": result, "total": total, "page": page, "page_size": page_size}


def get_article(db: Session, article_id: int, current_employee_id: int = None):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None

    author_user = db.query(User).filter(User.id == article.author_id).first()
    author_employee = db.query(Employee).filter(Employee.user_id == article.author_id).first()
    d = _enrich_article(article, author_user, author_employee)

    # Attach tasks with completion info
    tasks = db.query(ArticleTask).filter(ArticleTask.article_id == article_id).all()
    task_list = []
    for task in tasks:
        completion_count = db.query(func.count(TaskCompletion.id)).filter(
            TaskCompletion.task_id == task.id
        ).scalar() or 0
        completed_by_me = False
        if current_employee_id:
            completed_by_me = db.query(TaskCompletion).filter(
                TaskCompletion.task_id == task.id,
                TaskCompletion.employee_id == current_employee_id
            ).first() is not None
        task_list.append({
            "id": task.id,
            "article_id": task.article_id,
            "description": task.description,
            "created_by": task.created_by,
            "completion_count": completion_count,
            "completed_by_me": completed_by_me
        })
    d["tasks"] = task_list
    return d


def create_article(db: Session, data: dict, author_id: int):
    article = Article(
        title=data["title"],
        content=data["content"],
        tags=data.get("tags", []),
        department_tags=data.get("department_tags", []),
        author_id=author_id,
        status="draft"
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_article(db: Session, article_id: int, data: dict, current_user_id: int):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None
    # Only author or HR can edit
    if article.author_id != current_user_id:
        user = db.query(User).filter(User.id == current_user_id).first()
        if not user or user.role != "hr":
            raise PermissionError("Not the author")
    for key, value in data.items():
        if value is not None and hasattr(article, key):
            setattr(article, key, value)
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article


def submit_for_review(db: Session, article_id: int, current_user_id: int):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None
    if article.author_id != current_user_id:
        raise PermissionError("Not the author")
    article.status = "pending_review"
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article


def approve_article(db: Session, article_id: int):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None
    article.status = "published"
    article.published_at = datetime.utcnow()
    article.rejection_feedback = None
    db.commit()
    db.refresh(article)
    return article


def reject_article(db: Session, article_id: int, feedback: str = None):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None
    article.status = "rejected"
    article.rejection_feedback = feedback
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article


def toggle_recommended(db: Session, article_id: int, value: bool):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return None
    article.is_recommended = value
    article.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return article


def delete_article(db: Session, article_id: int):
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        return False
    db.delete(article)
    db.commit()
    return True


def get_all_tags(db: Session):
    """Return all unique tech tags and department tags used across published articles."""
    articles = db.query(Article).filter(Article.status == "published").all()
    tech_tags = set()
    dept_tags = set()
    for a in articles:
        for t in (a.tags or []):
            tech_tags.add(t)
        for t in (a.department_tags or []):
            dept_tags.add(t)
    return {"tech_tags": sorted(tech_tags), "department_tags": sorted(dept_tags)}


# ── Tasks ──────────────────────────────────────────────────────

def add_task(db: Session, article_id: int, description: str, created_by: int):
    task = ArticleTask(
        article_id=article_id,
        description=description,
        created_by=created_by
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int):
    task = db.query(ArticleTask).filter(ArticleTask.id == task_id).first()
    if task:
        db.query(TaskCompletion).filter(TaskCompletion.task_id == task_id).delete()
        db.delete(task)
        db.commit()
    return True


def toggle_task_completion(db: Session, task_id: int, employee_id: int):
    existing = db.query(TaskCompletion).filter(
        TaskCompletion.task_id == task_id,
        TaskCompletion.employee_id == employee_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return False   # uncompleted
    else:
        completion = TaskCompletion(task_id=task_id, employee_id=employee_id)
        db.add(completion)
        db.commit()
        return True    # completed


def get_task_completions(db: Session, task_id: int):
    rows = db.query(TaskCompletion, Employee.name).join(
        Employee, TaskCompletion.employee_id == Employee.id
    ).filter(TaskCompletion.task_id == task_id).all()
    return [{"employee_id": tc.employee_id, "employee_name": name, "completed_at": tc.completed_at}
            for tc, name in rows]


def get_my_pending_tasks(db: Session, employee_id: int):
    """Tasks from published articles that this employee hasn't completed yet."""
    completed_task_ids = db.query(TaskCompletion.task_id).filter(
        TaskCompletion.employee_id == employee_id
    ).subquery()

    tasks = db.query(ArticleTask, Article.title.label("article_title")).join(
        Article, ArticleTask.article_id == Article.id
    ).filter(
        Article.status == "published",
        ArticleTask.id.notin_(completed_task_ids)
    ).order_by(Article.published_at.desc()).limit(20).all()

    return [{"task_id": t.id, "task_description": t.description,
             "article_id": t.article_id, "article_title": title}
            for t, title in tasks]
