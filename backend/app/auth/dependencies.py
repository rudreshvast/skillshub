from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from starlette.requests import Request
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User
from app.models.employee import Employee
from app.auth.utils import decode_access_token
from app.core.designations import (
    MANAGEMENT_DESIGNATIONS,
    PROJECT_DESIGNATIONS,
    RECOMMENDED_AUTHOR_DESIGNATIONS,
)

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            raise ValueError()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_hr_role(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "hr":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR users can access this resource",
        )
    return current_user


def require_employee_role(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "employee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees can access this resource",
        )
    return current_user


def get_employee_for_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Employee | None:
    return db.query(Employee).filter(Employee.user_id == current_user.id).first()


def require_hr_or_management(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    if current_user.role == "hr":
        return current_user
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if employee and employee.designation in [d.value for d in MANAGEMENT_DESIGNATIONS]:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="HR or Management access required",
    )


def require_project_access(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    if current_user.role == "hr":
        return current_user
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if employee and employee.designation in [d.value for d in PROJECT_DESIGNATIONS]:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Project management access required",
    )


def require_recommended_author(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    if current_user.role == "hr":
        return current_user
    employee = db.query(Employee).filter(Employee.user_id == current_user.id).first()
    if employee and employee.designation in [d.value for d in RECOMMENDED_AUTHOR_DESIGNATIONS]:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Recommended author access required",
    )
