from sqlalchemy.orm import Session
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill


def get_people_list(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    department: str | None = None,
    designation: str | None = None,
    location: str | None = None,
    seniority: str | None = None,
    skill: str | None = None,
    search: str | None = None,
    profile_complete_only: bool = False,
) -> tuple[int, list[Employee]]:
    """Get paginated list of employees with optional filters."""
    query = db.query(Employee)

    if department:
        query = query.filter(Employee.department.ilike(f"%{department}%"))
    if designation:
        query = query.filter(Employee.designation.ilike(f"%{designation}%"))
    if location:
        query = query.filter(Employee.location.ilike(f"%{location}%"))
    if seniority:
        query = query.filter(Employee.seniority == seniority)
    if search:
        query = query.filter(Employee.name.ilike(f"%{search}%"))
    if profile_complete_only:
        query = query.filter(Employee.profile_complete == True)

    if skill:
        query = (
            query.join(EmployeeSkill, EmployeeSkill.employee_id == Employee.id)
            .filter(EmployeeSkill.skill_name.ilike(f"%{skill}%"))
            .distinct()
        )

    total = query.count()
    offset = (page - 1) * page_size
    employees = query.order_by(Employee.name.asc()).offset(offset).limit(page_size).all()

    return total, employees


def get_employee_public_profile(
    db: Session,
    employee_id: int,
) -> Employee | None:
    """Get full public profile for a single employee."""
    return db.query(Employee).filter(Employee.id == employee_id).first()


def get_filter_options(db: Session) -> dict:
    """Get available filter options for the directory sidebar."""
    departments = [
        row[0]
        for row in db.query(Employee.department)
        .distinct()
        .filter(Employee.department != None)
        .order_by(Employee.department)
        .all()
    ]

    locations = [
        row[0]
        for row in db.query(Employee.location)
        .distinct()
        .filter(Employee.location != None)
        .order_by(Employee.location)
        .all()
    ]

    designations = [
        row[0]
        for row in db.query(Employee.designation)
        .distinct()
        .filter(Employee.designation != None)
        .order_by(Employee.designation)
        .all()
    ]

    seniorities = ["junior", "mid", "senior", "lead", "principal"]

    skills = [
        row[0]
        for row in db.query(EmployeeSkill.skill_name)
        .distinct()
        .join(Employee, Employee.id == EmployeeSkill.employee_id)
        .filter(Employee.profile_complete == True)
        .filter(EmployeeSkill.is_inferred == False)
        .order_by(EmployeeSkill.skill_name)
        .all()
    ]

    return {
        "departments": departments,
        "locations": locations,
        "designations": designations,
        "seniorities": seniorities,
        "skills": skills,
    }


def get_employees_by_skill(db: Session, skill_name: str) -> dict:
    """Get all employees who have a given skill, grouped by proficiency."""
    results = (
        db.query(EmployeeSkill, Employee)
        .join(Employee, Employee.id == EmployeeSkill.employee_id)
        .filter(EmployeeSkill.skill_name.ilike(f"%{skill_name}%"))
        .filter(Employee.profile_complete == True)
        .filter(EmployeeSkill.is_inferred == False)
        .order_by(Employee.name.asc())
        .all()
    )

    expert = []
    intermediate = []
    novice = []
    canonical_skill_name = skill_name

    for es, emp in results:
        if results:
            canonical_skill_name = es.skill_name

        entry = {
            "employee_id_num": emp.id,
            "employee_id": emp.employee_id,
            "name": emp.name,
            "designation": emp.designation,
            "department": emp.department,
            "location": emp.location,
            "seniority": emp.seniority,
            "proficiency": es.proficiency,
            "years": es.years or 0,
        }

        if es.proficiency == "expert":
            expert.append(entry)
        elif es.proficiency == "intermediate":
            intermediate.append(entry)
        elif es.proficiency == "novice":
            novice.append(entry)

    return {
        "skill_name": canonical_skill_name,
        "total": len(results),
        "expert": expert,
        "intermediate": intermediate,
        "novice": novice,
    }
