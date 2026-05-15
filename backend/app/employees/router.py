from io import BytesIO
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.auth.dependencies import get_db, require_hr_role, get_current_user
from app.models.user import User
from app.employees.schemas import EmployeeCreate, EmployeeResponse, BulkImportResponse
from app.employees.service import (
    import_single_employee,
    import_bulk_employees,
    parse_csv_file,
    generate_csv_template,
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
    current_user: User = Depends(require_hr_role),
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
    current_user: User = Depends(require_hr_role),
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
