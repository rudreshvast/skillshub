from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, require_hr_role, get_current_user
from app.projects import service
from app.projects.schemas import (
    ProjectCreate, ProjectResponse, AllocationCreate, AllocationResponse,
    AllocationUpdate, AllocationMemberResponse, ProjectListResponse
)
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectListResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    return service.get_projects(db)


@router.post("", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    return service.create_project(
        db,
        name=project.name,
        description=project.description,
        status=project.status,
        start_date=project.start_date,
        end_date=project.end_date
    )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}/allocations", response_model=list[AllocationMemberResponse])
def list_allocations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return service.get_project_allocations(db, project_id)


@router.post("/{project_id}/allocations", response_model=AllocationMemberResponse)
def add_allocation(
    project_id: int,
    allocation: AllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        return service.add_allocation(db, project_id, allocation)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{project_id}/allocations/{allocation_id}", response_model=AllocationMemberResponse)
def update_allocation(
    project_id: int,
    allocation_id: int,
    allocation: AllocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        updated = service.update_allocation(db, allocation_id, allocation)
        if not updated:
            raise HTTPException(status_code=404, detail="Allocation not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{project_id}/allocations/{allocation_id}")
def remove_allocation(
    project_id: int,
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service.remove_allocation(db, allocation_id)
    return {"status": "deleted"}


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_hr_role(current_user)
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return service.update_project(db, project_id, project_update)
