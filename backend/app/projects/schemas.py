from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


class AllocationCreate(BaseModel):
    employee_id: int
    allocation_percentage: int
    role_in_project: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class AllocationUpdate(BaseModel):
    allocation_percentage: Optional[int] = None
    role_in_project: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    notes: Optional[str] = None


class AllocationResponse(BaseModel):
    id: int
    project_id: int
    employee_id: int
    allocation_percentage: int
    role_in_project: str
    start_date: Optional[date]
    end_date: Optional[date]
    notes: Optional[str]

    class Config:
        from_attributes = True


class AllocationMemberResponse(AllocationResponse):
    employee_name: str
    employee_designation: str
    employee_department: str
    employee_seniority: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    client: Optional[str] = None
    domain: Optional[str] = None
    tech_stack: Optional[list[str]] = []
    links: Optional[dict] = {}
    status: str = "active"
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    client: Optional[str] = None
    domain: Optional[str] = None
    tech_stack: Optional[list[str]] = None
    links: Optional[dict] = None
    status: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    client: Optional[str]
    domain: Optional[str]
    tech_stack: Optional[list[str]]
    links: Optional[dict]
    status: str
    start_date: Optional[date]
    end_date: Optional[date]
    created_by: Optional[int]

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    id: int
    name: str
    client: Optional[str]
    domain: Optional[str]
    tech_stack: Optional[list[str]]
    status: str
    start_date: Optional[date]
    end_date: Optional[date]
    team_size: int = 0

    class Config:
        from_attributes = True


class BenchPoolEntry(BaseModel):
    employee_id: int
    name: str
    designation: str
    department: str
    seniority: str
    days_on_bench: int

    class Config:
        from_attributes = True


class InnovationCreate(BaseModel):
    title: str
    content: str


class InnovationUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class InnovationResponse(BaseModel):
    id: int
    project_id: int
    title: str
    content: str
    created_by: int
    created_by_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ShortcomingCreate(BaseModel):
    title: str
    content: str
    linked_skill: Optional[str] = None


class ShortcomingUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    linked_skill: Optional[str] = None


class ShortcomingResponse(BaseModel):
    id: int
    project_id: int
    title: str
    content: str
    linked_skill: Optional[str]
    created_by: int
    created_by_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    current_team: list[AllocationMemberResponse] = []
    past_team: list[AllocationMemberResponse] = []
    innovations: list[InnovationResponse] = []
    shortcomings: list[ShortcomingResponse] = []


class MyAllocationResponse(BaseModel):
    id: int
    project_id: int
    project_name: str
    project_status: str
    role_in_project: str
    allocation_percentage: int
    start_date: Optional[date]
    end_date: Optional[date]
    notes: Optional[str]

    class Config:
        from_attributes = True
