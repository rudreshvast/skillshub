from datetime import date, datetime
from pydantic import BaseModel, EmailStr, field_validator


class EmployeeCreate(BaseModel):
    name: str
    employee_id: str
    email: EmailStr
    dob: date
    date_of_joining: date
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str = "mid"

    @field_validator("work_mode")
    @classmethod
    def validate_work_mode(cls, v: str) -> str:
        valid_modes = ["remote", "hybrid", "onsite"]
        if v.lower() not in valid_modes:
            raise ValueError(f"work_mode must be one of {valid_modes}")
        return v.lower()

    @field_validator("seniority")
    @classmethod
    def validate_seniority(cls, v: str) -> str:
        valid_levels = ["junior", "mid", "senior", "lead", "principal"]
        if v.lower() not in valid_levels:
            raise ValueError(f"seniority must be one of {valid_levels}")
        return v.lower()


class EmployeeResponse(BaseModel):
    id: int
    user_id: int
    employee_id: str
    name: str
    dob: date
    date_of_joining: date
    designation: str
    department: str
    location: str
    work_mode: str
    seniority: str
    profile_complete: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ImportError(BaseModel):
    row: int
    email: str
    reason: str


class BulkImportResponse(BaseModel):
    total: int
    success: int
    failed: int
    created: list[EmployeeResponse]
    errors: list[ImportError]
