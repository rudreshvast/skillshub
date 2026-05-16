from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.auth.dependencies import get_db, require_hr_or_management, get_current_user, get_employee_for_user
from app.projects import service
from app.projects.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse, AllocationCreate, AllocationResponse,
    AllocationUpdate, AllocationMemberResponse, ProjectListResponse, BenchPoolEntry, MyAllocationResponse,
    InnovationCreate, InnovationUpdate, InnovationResponse, ShortcomingCreate, ShortcomingUpdate, ShortcomingResponse
)
from app.models.user import User

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectListResponse])
def list_projects(
    status: Optional[str] = None,
    domain: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_projects(db, status=status, domain=domain)


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    return service.create_project(db, project.model_dump(), created_by=current_user.id)


@router.get("/bench", response_model=list[BenchPoolEntry])
def bench_pool(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return service.get_bench_pool(db)


@router.get("/my-allocations", response_model=list[MyAllocationResponse])
def my_allocations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    employee: Optional[object] = Depends(get_employee_for_user)
):
    if not employee:
        return []
    return service.get_my_allocations(db, employee.id)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = service.get_project_detail(db, project_id)
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    project, current_team, past_team, innovations, shortcomings = result
    return ProjectDetailResponse(
        **{c.name: getattr(project, c.name) for c in project.__table__.columns},
        current_team=current_team,
        past_team=past_team,
        innovations=innovations,
        shortcomings=shortcomings
    )


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    updated = service.update_project(db, project_id, data.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    deleted = service.delete_project(db, project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")


@router.get("/{project_id}/allocations", response_model=list[AllocationMemberResponse])
def list_allocations(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return service.get_project_allocations(db, project_id)


@router.post("/{project_id}/allocations", response_model=AllocationMemberResponse, status_code=201)
def add_allocation(
    project_id: int,
    allocation: AllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        return service.add_allocation(db, project_id, allocation)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{project_id}/allocations/{allocation_id}", response_model=AllocationMemberResponse)
def update_allocation(
    project_id: int,
    allocation_id: int,
    allocation: AllocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
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


@router.delete("/{project_id}/allocations/{allocation_id}", status_code=204)
def remove_allocation(
    project_id: int,
    allocation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    service.remove_allocation(db, allocation_id)


# --- Innovations ---

@router.post("/{project_id}/innovations", response_model=InnovationResponse, status_code=201)
def create_innovation(
    project_id: int,
    data: InnovationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return service.create_innovation(db, project_id, data.model_dump(), created_by=current_user.id)


@router.put("/{project_id}/innovations/{innovation_id}", response_model=InnovationResponse)
def update_innovation(
    project_id: int,
    innovation_id: int,
    data: InnovationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = service.update_innovation(db, innovation_id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="Innovation not found")
    return result


@router.delete("/{project_id}/innovations/{innovation_id}", status_code=204)
def delete_innovation(
    project_id: int,
    innovation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deleted = service.delete_innovation(db, innovation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Innovation not found")


# --- Shortcomings ---

@router.post("/{project_id}/shortcomings", response_model=ShortcomingResponse, status_code=201)
def create_shortcoming(
    project_id: int,
    data: ShortcomingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return service.create_shortcoming(db, project_id, data.model_dump(), created_by=current_user.id)


@router.put("/{project_id}/shortcomings/{shortcoming_id}", response_model=ShortcomingResponse)
def update_shortcoming(
    project_id: int,
    shortcoming_id: int,
    data: ShortcomingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = service.update_shortcoming(db, shortcoming_id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="Shortcoming not found")
    return result


@router.delete("/{project_id}/shortcomings/{shortcoming_id}", status_code=204)
def delete_shortcoming(
    project_id: int,
    shortcoming_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
):
    project = service.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deleted = service.delete_shortcoming(db, shortcoming_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Shortcoming not found")
