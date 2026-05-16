import csv
from datetime import date
from io import StringIO, BytesIO
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func, desc
from fastapi import HTTPException, UploadFile
from app.models.user import User
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.models.employee_project import EmployeeProject
from app.models.employee_certification import EmployeeCertification
from app.models.project import ProjectAllocation
from app.auth.utils import hash_password
from app.employees.schemas import (
    EmployeeCreate, EmployeeResponse, ImportError, BulkImportResponse,
    EmployeeListItem, EmployeeFullProfile, EmployeeListResponse, FilterOptions,
    SkillItem, ProjectItem, CertificationItem
)


def generate_default_password(email: str, dob: date) -> str:
    """Generate default password from email prefix and date of birth.

    Format: {email_prefix}{dob_as_DDMMYYYY}
    Example: john.doe@company.com + 1995-03-15 -> john.doe15031995
    """
    email_prefix = email.split("@")[0]
    dob_str = dob.strftime("%d%m%Y")
    return f"{email_prefix}{dob_str}"


def validate_employee_data(data: dict, db: Session) -> tuple[bool, str | None]:
    """Validate employee data before import.

    Returns (is_valid, error_message)
    """
    try:
        # Check email uniqueness
        existing_user = db.query(User).filter(User.email == data.get("email")).first()
        if existing_user:
            return False, "Email already exists"

        # Check employee_id uniqueness
        existing_emp = db.query(Employee).filter(Employee.employee_id == data.get("employee_id")).first()
        if existing_emp:
            return False, "Employee ID already exists"

        # Validate work_mode
        valid_work_modes = ["remote", "hybrid", "onsite"]
        if data.get("work_mode", "").lower() not in valid_work_modes:
            return False, f"Invalid work_mode. Must be one of {valid_work_modes}"

        # Validate seniority
        valid_seniority = ["junior", "mid", "senior", "lead", "principal"]
        seniority = data.get("seniority", "mid").lower()
        if seniority not in valid_seniority:
            return False, f"Invalid seniority. Must be one of {valid_seniority}"

        return True, None
    except Exception as e:
        return False, str(e)


def import_single_employee(db: Session, **kwargs) -> Employee:
    """Import a single employee.

    Creates User and Employee records in a transaction.
    Raises HTTPException on validation or uniqueness errors.
    """
    email = kwargs.get("email")
    password_plain = kwargs.get("password", generate_default_password(email, kwargs.get("dob")))

    # Validate data
    is_valid, error_msg = validate_employee_data(kwargs, db)
    if not is_valid:
        status_code = 409 if "exists" in error_msg else 400
        raise HTTPException(status_code=status_code, detail=error_msg)

    try:
        # Create User
        user = User(
            email=email,
            hashed_password=hash_password(password_plain),
            name=kwargs.get("name"),
            role="employee",
            is_active=True
        )
        db.add(user)
        db.flush()  # Get user.id without committing

        # Create Employee
        employee = Employee(
            user_id=user.id,
            employee_id=kwargs.get("employee_id"),
            name=kwargs.get("name"),
            dob=kwargs.get("dob"),
            date_of_joining=kwargs.get("date_of_joining"),
            designation=kwargs.get("designation"),
            department=kwargs.get("department"),
            location=kwargs.get("location"),
            work_mode=kwargs.get("work_mode").lower(),
            seniority=kwargs.get("seniority", "mid").lower(),
            profile_complete=False
        )
        db.add(employee)
        db.commit()

        return employee
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email or Employee ID already exists")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


def parse_csv_file(file: UploadFile) -> list[dict]:
    """Parse CSV file into list of dicts."""
    try:
        contents = file.file.read().decode("utf-8")
        reader = csv.DictReader(StringIO(contents))
        return list(reader)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")


def import_bulk_employees(db: Session, rows: list[dict]) -> BulkImportResponse:
    """Import multiple employees from CSV data.

    Processes all rows, doesn't stop on first error.
    Returns summary with created employees and per-row errors.
    """
    created_employees = []
    errors = []

    for row_num, row in enumerate(rows, start=1):
        try:
            # Parse date fields
            dob = date.fromisoformat(row.get("dob", "").strip())
            date_of_joining = date.fromisoformat(row.get("date_of_joining", "").strip())

            employee_data = {
                "name": row.get("name", "").strip(),
                "employee_id": row.get("employee_id", "").strip(),
                "email": row.get("email", "").strip(),
                "dob": dob,
                "date_of_joining": date_of_joining,
                "designation": row.get("designation", "").strip(),
                "department": row.get("department", "").strip(),
                "location": row.get("location", "").strip(),
                "work_mode": row.get("work_mode", "").strip(),
                "seniority": row.get("seniority", "mid").strip().lower(),
            }

            # Validate
            is_valid, error_msg = validate_employee_data(employee_data, db)
            if not is_valid:
                errors.append({
                    "row": row_num,
                    "email": employee_data.get("email", ""),
                    "reason": error_msg
                })
                continue

            # Import
            employee = import_single_employee(db, **employee_data)
            created_employees.append(EmployeeResponse.model_validate(employee))
        except ValueError as e:
            errors.append({
                "row": row_num,
                "email": row.get("email", ""),
                "reason": f"Invalid date format: {str(e)}"
            })
        except HTTPException as e:
            errors.append({
                "row": row_num,
                "email": row.get("email", ""),
                "reason": e.detail
            })
        except Exception as e:
            errors.append({
                "row": row_num,
                "email": row.get("email", ""),
                "reason": str(e)
            })

    return BulkImportResponse(
        total=len(rows),
        success=len(created_employees),
        failed=len(errors),
        created=created_employees,
        errors=errors
    )


def generate_csv_template() -> str:
    """Generate CSV template with headers and sample rows."""
    headers = [
        "employee_id", "name", "email", "dob", "date_of_joining",
        "designation", "department", "location", "work_mode", "seniority"
    ]

    sample_rows = [
        ["EMP001", "John Doe", "john.doe@company.com", "1995-03-15", "2024-01-01",
         "Software Engineer", "Engineering", "Bangalore", "hybrid", "mid"],
        ["EMP002", "Jane Smith", "jane.smith@company.com", "1998-07-22", "2024-02-15",
         "Product Manager", "Product", "Remote", "remote", "senior"],
    ]

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(sample_rows)

    return output.getvalue()


def _get_employee_current_allocation(db: Session, employee_id: int) -> int:
    """Get the current allocation percentage for an employee."""
    today = date.today()
    result = db.query(func.sum(ProjectAllocation.allocation_percentage)).filter(
        ProjectAllocation.employee_id == employee_id,
        (ProjectAllocation.end_date.is_(None)) | (ProjectAllocation.end_date >= today)
    ).scalar()
    return result or 0


def get_employee_list(
    db: Session,
    search: str | None = None,
    department: str | None = None,
    location: str | None = None,
    work_mode: str | None = None,
    seniority: str | None = None,
    skill: str | None = None,
    profile_complete: bool | None = None,
    page: int = 1,
    page_size: int = 20
) -> EmployeeListResponse:
    """Get paginated list of employees with optional filters."""
    query = db.query(Employee)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Employee.name.ilike(search_term)) | (Employee.designation.ilike(search_term))
        )

    if department:
        query = query.filter(Employee.department == department)

    if location:
        query = query.filter(Employee.location == location)

    if work_mode:
        query = query.filter(Employee.work_mode == work_mode)

    if seniority:
        query = query.filter(Employee.seniority == seniority)

    if profile_complete is not None:
        query = query.filter(Employee.profile_complete == profile_complete)

    if skill:
        skill_term = f"%{skill}%"
        employee_ids_with_skill = db.query(EmployeeSkill.employee_id).filter(
            EmployeeSkill.skill_name.ilike(skill_term)
        ).distinct()
        query = query.filter(Employee.id.in_(employee_ids_with_skill))

    total = query.count()
    employees = query.offset((page - 1) * page_size).limit(page_size).all()

    employee_items = []
    for emp in employees:
        skills = db.query(EmployeeSkill).filter(
            EmployeeSkill.employee_id == emp.id,
            EmployeeSkill.is_inferred == False
        ).all()

        proficiency_order = {"expert": 0, "intermediate": 1, "novice": 2}
        sorted_skills = sorted(
            skills,
            key=lambda s: proficiency_order.get(s.proficiency, 3)
        )

        top_skills = [s.skill_name for s in sorted_skills[:4]]
        current_allocation = _get_employee_current_allocation(db, emp.id)

        item = EmployeeListItem(
            id=emp.id,
            name=emp.name,
            designation=emp.designation,
            department=emp.department,
            location=emp.location,
            work_mode=emp.work_mode,
            seniority=emp.seniority,
            years_of_experience=emp.years_of_experience,
            profile_complete=emp.profile_complete,
            domain_expertise=emp.domain_expertise,
            top_skills=top_skills,
            current_allocation_percentage=current_allocation
        )
        employee_items.append(item)

    return EmployeeListResponse(
        total=total,
        page=page,
        page_size=page_size,
        employees=employee_items
    )


def get_employee_full_profile(db: Session, emp_id: int) -> EmployeeFullProfile:
    """Get full employee profile with all related data."""
    employee = db.query(Employee).filter(Employee.id == emp_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == emp_id).all()
    projects = db.query(EmployeeProject).filter(EmployeeProject.employee_id == emp_id).all()
    certifications = db.query(EmployeeCertification).filter(EmployeeCertification.employee_id == emp_id).all()

    skill_items = [SkillItem.model_validate(s) for s in skills]
    project_items = [ProjectItem.model_validate(p) for p in projects]
    cert_items = [CertificationItem.model_validate(c) for c in certifications]

    return EmployeeFullProfile(
        id=employee.id,
        name=employee.name,
        designation=employee.designation,
        department=employee.department,
        location=employee.location,
        work_mode=employee.work_mode,
        seniority=employee.seniority,
        years_of_experience=employee.years_of_experience,
        summary=employee.summary,
        domain_expertise=employee.domain_expertise,
        profile_complete=employee.profile_complete,
        date_of_joining=employee.date_of_joining,
        employee_id=employee.employee_id,
        skills=skill_items,
        projects=project_items,
        certifications=cert_items
    )


def get_filter_options(db: Session) -> FilterOptions:
    """Get unique filter values for dropdowns."""
    departments = [d[0] for d in db.query(Employee.department).distinct().all() if d[0]]
    locations = [l[0] for l in db.query(Employee.location).distinct().all() if l[0]]

    top_skills = [
        s[0] for s in db.query(EmployeeSkill.skill_name).group_by(EmployeeSkill.skill_name)
        .order_by(desc(func.count())).limit(50).all()
    ]

    work_modes = ["remote", "hybrid", "onsite"]
    seniorities = ["junior", "mid", "senior", "lead", "principal"]

    return FilterOptions(
        departments=sorted(departments),
        locations=sorted(locations),
        work_modes=work_modes,
        seniorities=seniorities,
        skills=top_skills
    )
