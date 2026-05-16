from datetime import date, datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.project import Project, ProjectAllocation
from app.models.project_innovation import ProjectInnovation
from app.models.project_shortcoming import ProjectShortcoming
from app.models.employee import Employee
from app.models.user import User
from app.projects.schemas import AllocationCreate, AllocationUpdate, AllocationMemberResponse


def get_projects(db: Session, status: str = None, domain: str = None):
    query = db.query(Project)
    if status:
        query = query.filter(Project.status == status)
    if domain:
        query = query.filter(Project.domain.ilike(f"%{domain}%"))
    projects = query.order_by(Project.created_at.desc()).all()

    result = []
    for p in projects:
        team_size = db.query(func.count(ProjectAllocation.id)).filter(
            ProjectAllocation.project_id == p.id,
            (ProjectAllocation.end_date.is_(None)) | (ProjectAllocation.end_date >= date.today())
        ).scalar() or 0
        p.__dict__['team_size'] = team_size
        result.append(p)
    return result


def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()


def get_project_detail(db: Session, project_id: int):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None

    today = date.today()
    all_allocs = get_project_allocations(db, project_id)
    current_team = [a for a in all_allocs if a.end_date is None or a.end_date >= today]
    past_team = [a for a in all_allocs if a.end_date is not None and a.end_date < today]

    innovations = get_innovations(db, project_id)
    shortcomings = get_shortcomings(db, project_id)

    return project, current_team, past_team, innovations, shortcomings


def create_project(db: Session, data: dict, created_by: int = None):
    project = Project(
        name=data.get("name"),
        description=data.get("description"),
        client=data.get("client"),
        domain=data.get("domain"),
        tech_stack=data.get("tech_stack", []),
        links=data.get("links", {}),
        status=data.get("status", "active"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        created_by=created_by
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_project_allocations(db: Session, project_id: int) -> list[AllocationMemberResponse]:
    allocations = db.query(
        ProjectAllocation,
        Employee.name.label("employee_name"),
        Employee.designation.label("employee_designation"),
        Employee.department.label("employee_department"),
        Employee.seniority.label("employee_seniority")
    ).join(Employee, ProjectAllocation.employee_id == Employee.id).filter(
        ProjectAllocation.project_id == project_id
    ).order_by(ProjectAllocation.created_at.desc()).all()

    result = []
    for alloc, name, designation, department, seniority in allocations:
        result.append(AllocationMemberResponse(
            id=alloc.id,
            project_id=alloc.project_id,
            employee_id=alloc.employee_id,
            allocation_percentage=alloc.allocation_percentage,
            role_in_project=alloc.role_in_project,
            start_date=alloc.start_date,
            end_date=alloc.end_date,
            notes=alloc.notes,
            employee_name=name,
            employee_designation=designation,
            employee_department=department,
            employee_seniority=seniority
        ))
    return result


def get_my_allocations(db: Session, employee_id: int) -> list:
    allocations = db.query(
        ProjectAllocation,
        Project.name.label("project_name"),
        Project.status.label("project_status")
    ).join(Project, ProjectAllocation.project_id == Project.id).filter(
        ProjectAllocation.employee_id == employee_id
    ).order_by(ProjectAllocation.created_at.desc()).all()

    result = []
    for alloc, project_name, project_status in allocations:
        result.append({
            "id": alloc.id,
            "project_id": alloc.project_id,
            "project_name": project_name,
            "project_status": project_status,
            "role_in_project": alloc.role_in_project,
            "allocation_percentage": alloc.allocation_percentage,
            "start_date": alloc.start_date,
            "end_date": alloc.end_date,
            "notes": alloc.notes,
        })
    return result


def get_employee_current_allocation(db: Session, employee_id: int) -> int:
    today = date.today()
    result = db.query(func.sum(ProjectAllocation.allocation_percentage)).filter(
        ProjectAllocation.employee_id == employee_id,
        ProjectAllocation.end_date.is_(None) | (ProjectAllocation.end_date >= today)
    ).scalar()
    return result or 0


def add_allocation(db: Session, project_id: int, data: AllocationCreate):
    current = get_employee_current_allocation(db, data.employee_id)
    max_available = 100 - current

    if data.allocation_percentage > max_available:
        raise ValueError(f"allocation_would_exceed: max available is {max_available}%")

    allocation = ProjectAllocation(
        project_id=project_id,
        employee_id=data.employee_id,
        allocation_percentage=data.allocation_percentage,
        role_in_project=data.role_in_project,
        start_date=data.start_date,
        end_date=data.end_date,
        notes=data.notes
    )
    db.add(allocation)
    db.commit()
    db.refresh(allocation)

    employee = db.query(Employee).filter(Employee.id == allocation.employee_id).first()
    return AllocationMemberResponse(
        id=allocation.id,
        project_id=allocation.project_id,
        employee_id=allocation.employee_id,
        allocation_percentage=allocation.allocation_percentage,
        role_in_project=allocation.role_in_project,
        start_date=allocation.start_date,
        end_date=allocation.end_date,
        notes=allocation.notes,
        employee_name=employee.name,
        employee_designation=employee.designation,
        employee_department=employee.department,
        employee_seniority=employee.seniority
    )


def update_allocation(db: Session, allocation_id: int, data: AllocationUpdate):
    allocation = db.query(ProjectAllocation).filter(ProjectAllocation.id == allocation_id).first()
    if not allocation:
        return None

    if data.allocation_percentage is not None and data.allocation_percentage != allocation.allocation_percentage:
        current = get_employee_current_allocation(db, allocation.employee_id)
        freed = allocation.allocation_percentage
        new_current = current - freed + data.allocation_percentage

        if new_current > 100:
            max_available = 100 - (current - freed)
            raise ValueError(f"allocation_would_exceed: max available is {max_available}%")

        allocation.allocation_percentage = data.allocation_percentage

    if data.role_in_project is not None:
        allocation.role_in_project = data.role_in_project
    if data.start_date is not None:
        allocation.start_date = data.start_date
    if data.end_date is not None:
        allocation.end_date = data.end_date
    if data.notes is not None:
        allocation.notes = data.notes

    allocation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(allocation)

    employee = db.query(Employee).filter(Employee.id == allocation.employee_id).first()
    return AllocationMemberResponse(
        id=allocation.id,
        project_id=allocation.project_id,
        employee_id=allocation.employee_id,
        allocation_percentage=allocation.allocation_percentage,
        role_in_project=allocation.role_in_project,
        start_date=allocation.start_date,
        end_date=allocation.end_date,
        notes=allocation.notes,
        employee_name=employee.name,
        employee_designation=employee.designation,
        employee_department=employee.department,
        employee_seniority=employee.seniority
    )


def remove_allocation(db: Session, allocation_id: int):
    allocation = db.query(ProjectAllocation).filter(ProjectAllocation.id == allocation_id).first()
    if allocation:
        db.delete(allocation)
        db.commit()
    return True


def update_project(db: Session, project_id: int, data: dict):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return None

    for key, value in data.items():
        if hasattr(project, key) and value is not None:
            setattr(project, key, value)

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> bool:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return False
    db.query(ProjectAllocation).filter(ProjectAllocation.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    return True


def get_bench_pool(db: Session) -> list:
    today = date.today()

    active_employee_ids = db.query(ProjectAllocation.employee_id).filter(
        ProjectAllocation.end_date.is_(None) | (ProjectAllocation.end_date >= today)
    ).distinct().subquery()

    benched = db.query(Employee).filter(
        Employee.id.notin_(db.query(ProjectAllocation.employee_id).filter(
            ProjectAllocation.end_date.is_(None) | (ProjectAllocation.end_date >= today)
        ).distinct()),
        Employee.profile_complete == True
    ).all()

    result = []
    for emp in benched:
        last_alloc = db.query(ProjectAllocation).filter(
            ProjectAllocation.employee_id == emp.id
        ).order_by(ProjectAllocation.end_date.desc()).first()

        if last_alloc and last_alloc.end_date:
            days_on_bench = (today - last_alloc.end_date).days
        elif emp.date_of_joining:
            days_on_bench = (today - emp.date_of_joining).days
        else:
            days_on_bench = 0

        result.append({
            "employee_id": emp.id,
            "name": emp.name,
            "designation": emp.designation or "",
            "department": emp.department or "",
            "seniority": emp.seniority or "",
            "days_on_bench": max(0, days_on_bench)
        })

    result.sort(key=lambda x: x["days_on_bench"], reverse=True)
    return result


def get_innovations(db: Session, project_id: int) -> list:
    rows = db.query(ProjectInnovation, User.name.label("created_by_name")).join(
        User, ProjectInnovation.created_by == User.id
    ).filter(ProjectInnovation.project_id == project_id).order_by(
        ProjectInnovation.created_at.desc()
    ).all()

    result = []
    for innov, created_by_name in rows:
        d = {c.name: getattr(innov, c.name) for c in innov.__table__.columns}
        d["created_by_name"] = created_by_name
        result.append(d)
    return result


def create_innovation(db: Session, project_id: int, data: dict, created_by: int):
    innov = ProjectInnovation(
        project_id=project_id,
        title=data["title"],
        content=data["content"],
        created_by=created_by
    )
    db.add(innov)
    db.commit()
    db.refresh(innov)

    user = db.query(User).filter(User.id == created_by).first()
    return {
        **{c.name: getattr(innov, c.name) for c in innov.__table__.columns},
        "created_by_name": user.name if user else None
    }


def update_innovation(db: Session, innovation_id: int, data: dict):
    innov = db.query(ProjectInnovation).filter(ProjectInnovation.id == innovation_id).first()
    if not innov:
        return None
    for key, value in data.items():
        if value is not None and hasattr(innov, key):
            setattr(innov, key, value)
    db.commit()
    db.refresh(innov)
    user = db.query(User).filter(User.id == innov.created_by).first()
    d = {c.name: getattr(innov, c.name) for c in innov.__table__.columns}
    d["created_by_name"] = user.name if user else None
    return d


def delete_innovation(db: Session, innovation_id: int) -> bool:
    innov = db.query(ProjectInnovation).filter(ProjectInnovation.id == innovation_id).first()
    if not innov:
        return False
    db.delete(innov)
    db.commit()
    return True


def get_shortcomings(db: Session, project_id: int) -> list:
    rows = db.query(ProjectShortcoming, User.name.label("created_by_name")).join(
        User, ProjectShortcoming.created_by == User.id
    ).filter(ProjectShortcoming.project_id == project_id).order_by(
        ProjectShortcoming.created_at.desc()
    ).all()

    result = []
    for short, created_by_name in rows:
        d = {c.name: getattr(short, c.name) for c in short.__table__.columns}
        d["created_by_name"] = created_by_name
        result.append(d)
    return result


def create_shortcoming(db: Session, project_id: int, data: dict, created_by: int):
    short = ProjectShortcoming(
        project_id=project_id,
        title=data["title"],
        content=data["content"],
        linked_skill=data.get("linked_skill"),
        created_by=created_by
    )
    db.add(short)
    db.commit()
    db.refresh(short)

    user = db.query(User).filter(User.id == created_by).first()
    return {
        **{c.name: getattr(short, c.name) for c in short.__table__.columns},
        "created_by_name": user.name if user else None
    }


def update_shortcoming(db: Session, shortcoming_id: int, data: dict):
    short = db.query(ProjectShortcoming).filter(ProjectShortcoming.id == shortcoming_id).first()
    if not short:
        return None
    for key, value in data.items():
        if value is not None and hasattr(short, key):
            setattr(short, key, value)
    db.commit()
    db.refresh(short)
    user = db.query(User).filter(User.id == short.created_by).first()
    d = {c.name: getattr(short, c.name) for c in short.__table__.columns}
    d["created_by_name"] = user.name if user else None
    return d


def delete_shortcoming(db: Session, shortcoming_id: int) -> bool:
    short = db.query(ProjectShortcoming).filter(ProjectShortcoming.id == shortcoming_id).first()
    if not short:
        return False
    db.delete(short)
    db.commit()
    return True
