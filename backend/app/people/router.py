from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.people import service
from app.people.schemas import (
    PeopleListResponse,
    EmployeeCard,
    EmployeePublicProfile,
    SkillSummary,
    ProjectSummary,
    CertificationSummary,
    PeopleFilterOptions,
    SkillBrowseResponse,
)

router = APIRouter(prefix="/people", tags=["people"])


@router.get("", response_model=PeopleListResponse)
def get_people(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    department: str | None = Query(default=None),
    designation: str | None = Query(default=None),
    location: str | None = Query(default=None),
    seniority: str | None = Query(default=None),
    skill: str | None = Query(default=None),
    search: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Directory listing with filters and pagination."""
    total, employees = service.get_people_list(
        db,
        page=page,
        page_size=page_size,
        department=department,
        designation=designation,
        location=location,
        seniority=seniority,
        skill=skill,
        search=search,
    )

    employee_cards = []
    for emp in employees:
        top_skills = sorted(
            [s for s in emp.skills if not s.is_inferred],
            key=lambda s: (
                {"expert": 0, "intermediate": 1, "novice": 2}.get(s.proficiency, 3),
                -s.years if s.years else 0,
            ),
        )[:4]

        card = EmployeeCard(
            id=emp.id,
            employee_id=emp.employee_id,
            name=emp.name,
            designation=emp.designation,
            department=emp.department,
            location=emp.location,
            work_mode=emp.work_mode,
            seniority=emp.seniority,
            years_of_experience=emp.years_of_experience,
            domain_expertise=emp.domain_expertise or [],
            profile_complete=emp.profile_complete,
            top_skills=[SkillSummary.from_attributes(s) for s in top_skills],
        )
        employee_cards.append(card)

    return PeopleListResponse(
        total=total,
        page=page,
        page_size=page_size,
        employees=employee_cards,
    )


@router.get("/filters", response_model=PeopleFilterOptions)
def get_filter_options(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns available filter options for the directory sidebar."""
    opts = service.get_filter_options(db)
    return PeopleFilterOptions(**opts)


@router.get("/skills/{skill_name}", response_model=SkillBrowseResponse)
def get_skill_browse(
    skill_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns all employees who have a given skill, grouped by proficiency."""
    result = service.get_employees_by_skill(db, skill_name)
    if result["total"] == 0:
        raise HTTPException(status_code=404, detail=f"No employees found with skill: {skill_name}")
    return SkillBrowseResponse(**result)


@router.get("/{employee_id}", response_model=EmployeePublicProfile)
def get_employee_profile(
    employee_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Full public profile for a single employee."""
    employee = service.get_employee_public_profile(db, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    skills = [SkillSummary.from_attributes(s) for s in employee.skills]
    skills.sort(
        key=lambda s: (
            (0 if not s.is_inferred else 1),
            {"expert": 0, "intermediate": 1, "novice": 2}.get(s.proficiency, 3),
        )
    )

    projects = [ProjectSummary.from_attributes(p) for p in employee.projects]
    certifications = [CertificationSummary.from_attributes(c) for c in employee.certifications]

    return EmployeePublicProfile(
        id=employee.id,
        employee_id=employee.employee_id,
        name=employee.name,
        designation=employee.designation,
        department=employee.department,
        location=employee.location,
        work_mode=employee.work_mode,
        seniority=employee.seniority,
        years_of_experience=employee.years_of_experience,
        domain_expertise=employee.domain_expertise or [],
        summary=employee.summary,
        profile_complete=employee.profile_complete,
        date_of_joining=employee.date_of_joining,
        skills=skills,
        projects=projects,
        certifications=certifications,
    )
