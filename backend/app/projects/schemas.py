from pydantic import BaseModel
from datetime import date
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
    status: str = "active"
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: str
    start_date: Optional[date]
    end_date: Optional[date]

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    id: int
    name: str
    status: str

    class Config:
        from_attributes = True
