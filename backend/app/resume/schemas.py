from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SkillExtracted(BaseModel):
    name: str
    category: str
    proficiency: str
    years: Optional[int] = None


class InferredSkill(BaseModel):
    name: str
    inferred_from: str
    confidence: float
    category: str


class ProjectExtracted(BaseModel):
    name: str
    role: Optional[str] = None
    duration: Optional[str] = None
    domain: Optional[str] = None
    technologies: Optional[List[str]] = None


class CertificationExtracted(BaseModel):
    name: str
    issuer: Optional[str] = None
    issued_on: Optional[str] = None


class ExtractedProfile(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    current_role: Optional[str] = None
    seniority: Optional[str] = None
    years_of_experience: Optional[int] = None
    summary: Optional[str] = None
    skills: List[SkillExtracted] = []
    inferred_skills: List[InferredSkill] = []
    projects: List[ProjectExtracted] = []
    certifications: List[CertificationExtracted] = []
    domain_expertise: Optional[List[str]] = None


class PendingProfileResponse(BaseModel):
    id: int
    employee_id: int
    extracted_data: dict
    original_pdf_path: str
    status: str
    uploaded_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None

    model_config = {"from_attributes": True}


class PendingProfileWithEmployee(BaseModel):
    id: int
    employee_id: int
    extracted_data: dict
    original_pdf_path: str
    status: str
    uploaded_at: datetime
    reviewed_at: Optional[datetime] = None
    employee_name: str
    designation: str
    department: str

    model_config = {"from_attributes": True}


class ApproveRequest(BaseModel):
    extracted_data: dict
