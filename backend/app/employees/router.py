from io import BytesIO
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, require_hr_or_management, get_current_user
from app.models.user import User
from app.employees.schemas import (
    EmployeeCreate, EmployeeResponse, BulkImportResponse,
    EmployeeListResponse, EmployeeFullProfile, FilterOptions
)
from app.employees.service import (
    import_single_employee,
    import_bulk_employees,
    parse_csv_file,
    generate_csv_template,
    get_employee_list,
    get_employee_full_profile,
    get_filter_options,
)

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("/import/template")
def get_import_template(db: Session = Depends(get_db)):
    """Get CSV template for bulk employee import."""
    csv_content = generate_csv_template()
    return StreamingResponse(
        iter([csv_content.encode()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=employee_import_template.csv"}
    )


@router.post("/import/single", response_model=EmployeeResponse, status_code=201)
def import_single(
    employee_data: EmployeeCreate,
    current_user: User = Depends(require_hr_or_management),
    db: Session = Depends(get_db),
):
    """Import a single employee (HR only)."""
    employee = import_single_employee(
        db,
        name=employee_data.name,
        employee_id=employee_data.employee_id,
        email=employee_data.email,
        dob=employee_data.dob,
        date_of_joining=employee_data.date_of_joining,
        designation=employee_data.designation,
        department=employee_data.department,
        location=employee_data.location,
        work_mode=employee_data.work_mode,
        seniority=employee_data.seniority,
    )
    return employee


@router.post("/import/bulk", response_model=BulkImportResponse)
async def import_bulk(
    file: UploadFile = File(...),
    current_user: User = Depends(require_hr_or_management),
    db: Session = Depends(get_db),
):
    """Bulk import employees from CSV (HR only)."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    rows = parse_csv_file(file)
    if not rows:
        raise HTTPException(status_code=400, detail="CSV is empty")

    result = import_bulk_employees(db, rows)
    return result


@router.get("/filters/options", response_model=FilterOptions)
def get_filter_dropdown_options(
    current_user: User = Depends(require_hr_or_management),
    db: Session = Depends(get_db),
):
    """Get unique filter values for directory dropdowns (HR only)."""
    return get_filter_options(db)


@router.get("", response_model=EmployeeListResponse)
def list_employees(
    search: str | None = None,
    department: str | None = None,
    location: str | None = None,
    work_mode: str | None = None,
    seniority: str | None = None,
    skill: str | None = None,
    profile_complete: bool | None = None,
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(require_hr_or_management),
    db: Session = Depends(get_db),
):
    """Get paginated list of employees with optional filters (HR only)."""
    return get_employee_list(
        db=db,
        search=search,
        department=department,
        location=location,
        work_mode=work_mode,
        seniority=seniority,
        skill=skill,
        profile_complete=profile_complete,
        page=page,
        page_size=page_size,
    )


@router.get("/{emp_id}", response_model=EmployeeFullProfile)
def get_employee_profile(
    emp_id: int,
    current_user: User = Depends(require_hr_or_management),
    db: Session = Depends(get_db),
):
    """Get full employee profile (HR only)."""
    return get_employee_full_profile(db, emp_id)


@router.get("/directory", response_model=EmployeeListResponse)
def get_employee_directory(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    department: str | None = Query(default=None),
    location: str | None = Query(default=None),
    work_mode: str | None = Query(default=None),
    seniority: str | None = Query(default=None),
    skill: str | None = Query(default=None),
    current_user: User = Depends(require_hr_or_management),
    db: Session = Depends(get_db),
):
    """
    HR/Management directory view.
    Frontend /hr/employees page calls this.
    """
    return get_employee_list(
        db=db,
        search=search,
        department=department,
        location=location,
        work_mode=work_mode,
        seniority=seniority,
        skill=skill,
        page=page,
        page_size=page_size,
    )
