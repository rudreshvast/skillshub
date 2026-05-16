from datetime import date, datetime
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.project import Project, ProjectAllocation
from app.models.employee import Employee
from app.projects.schemas import AllocationCreate, AllocationUpdate, AllocationMemberResponse


def get_projects(db: Session):
    return db.query(Project).all()


def get_project(db: Session, project_id: int):
    return db.query(Project).filter(Project.id == project_id).first()


def create_project(db: Session, name: str, description: str = None, status: str = "active", start_date: date = None, end_date: date = None):
    project = Project(
        name=name,
        description=description,
        status=status,
        start_date=start_date,
        end_date=end_date
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
        if hasattr(project, key):
            setattr(project, key, value)

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project
