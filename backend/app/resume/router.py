import os
import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_user, require_hr_role, require_employee_role, require_hr_or_management
from app.models.user import User
from app.models.employee import Employee
from app.models.pending_profile import PendingProfile
from app.resume import service
from app.resume.schemas import (
    PendingProfileResponse,
    PendingProfileWithEmployee,
    ApproveRequest,
    ExtractedProfile
)


router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee_role)
) -> ExtractedProfile:
    """Upload resume PDF and extract profile data."""
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted"
        )

    # Get employee record
    employee = db.query(Employee).filter(
        Employee.user_id == current_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee record not found"
        )

    # Create uploads directory if it doesn't exist
    upload_dir = "backend/uploads/resumes"
    os.makedirs(upload_dir, exist_ok=True)

    # Save PDF file
    timestamp = int(datetime.utcnow().timestamp() * 1000)
    pdf_filename = f"{employee.id}_{timestamp}.pdf"
    pdf_path = os.path.join(upload_dir, pdf_filename)

    try:
        content = await file.read()

        # Validate file size (10MB)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds 10MB limit"
            )

        with open(pdf_path, "wb") as f:
            f.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save file: {str(e)}"
        )

    # Extract text using asyncio.to_thread
    try:
        raw_text = await asyncio.to_thread(service.extract_text_from_pdf, pdf_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text: {str(e)}"
        )

    # Validate extracted text
    if len(raw_text) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract readable text from this PDF"
        )

    # Call Claude API using asyncio.to_thread
    try:
        extracted_data = await asyncio.to_thread(service.call_claude_api, raw_text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract profile: {str(e)}"
        )

    # Save to pending_profiles table
    try:
        profile = service.get_or_create_employee_pending_profile(
            db, employee.id, extracted_data, pdf_path
        )
        db.commit()
        return ExtractedProfile(**extracted_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save profile: {str(e)}"
        )


@router.post("/upload/{employee_id}")
async def upload_resume_for_employee(
    employee_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_role)
) -> ExtractedProfile:
    """Upload resume PDF for an employee (HR only)."""
    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are accepted"
        )

    # Verify employee exists
    employee = db.query(Employee).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    # Create uploads directory if it doesn't exist
    upload_dir = "backend/uploads/resumes"
    os.makedirs(upload_dir, exist_ok=True)

    # Save PDF file
    timestamp = int(datetime.utcnow().timestamp() * 1000)
    pdf_filename = f"{employee_id}_{timestamp}.pdf"
    pdf_path = os.path.join(upload_dir, pdf_filename)

    try:
        content = await file.read()

        # Validate file size (10MB)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File size exceeds 10MB limit"
            )

        with open(pdf_path, "wb") as f:
            f.write(content)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save file: {str(e)}"
        )

    # Extract text using asyncio.to_thread
    try:
        raw_text = await asyncio.to_thread(service.extract_text_from_pdf, pdf_path)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text: {str(e)}"
        )

    # Validate extracted text
    if len(raw_text) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract readable text from this PDF"
        )

    # Call Claude API using asyncio.to_thread
    try:
        extracted_data = await asyncio.to_thread(service.call_claude_api, raw_text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract profile: {str(e)}"
        )

    # Save to pending_profiles table with uploaded_by set to current user
    try:
        profile = service.get_or_create_employee_pending_profile(
            db, employee_id, extracted_data, pdf_path
        )
        profile.uploaded_by = current_user.id
        db.commit()
        return ExtractedProfile(**extracted_data)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to save profile: {str(e)}"
        )


@router.get("/my-profile")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_employee_role)
) -> PendingProfileResponse | None:
    """Get current employee's pending resume profile."""
    employee = db.query(Employee).filter(
        Employee.user_id == current_user.id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee record not found"
        )

    profile = db.query(PendingProfile).filter(
        PendingProfile.employee_id == employee.id
    ).first()

    if not profile:
        return None

    return PendingProfileResponse.model_validate(profile)


@router.get("/review-queue")
def get_review_queue(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
) -> list[PendingProfileWithEmployee]:
    """Get all pending profiles for HR review."""
    pending = service.get_review_queue(db)

    result = []
    for row in pending:
        item = PendingProfileWithEmployee(
            id=row["id"],
            employee_id=row["employee_id"],
            extracted_data=row["extracted_data"],
            original_pdf_path=row["original_pdf_path"],
            status=row["status"],
            uploaded_at=row["uploaded_at"],
            uploaded_by=row["uploaded_by"],
            reviewed_at=row["reviewed_at"],
            employee_name=row["employee_name"],
            designation=row["designation"],
            department=row["department"]
        )
        result.append(item)

    return result


@router.get("/review-queue/{pending_profile_id}")
def get_pending_profile(
    pending_profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
) -> PendingProfileWithEmployee:
    """Get specific pending profile for review."""
    profile = db.query(PendingProfile).filter(
        PendingProfile.id == pending_profile_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    employee = db.query(Employee).filter(
        Employee.id == profile.employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    return PendingProfileWithEmployee(
        id=profile.id,
        employee_id=profile.employee_id,
        extracted_data=profile.extracted_data,
        original_pdf_path=profile.original_pdf_path,
        status=profile.status,
        uploaded_at=profile.uploaded_at,
        reviewed_at=profile.reviewed_at,
        employee_name=employee.name,
        designation=employee.designation,
        department=employee.department
    )


@router.post("/review-queue/{pending_profile_id}/approve")
def approve_profile(
    pending_profile_id: int,
    request: ApproveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
) -> dict:
    """Approve and save resume profile."""
    employee = service.approve_profile(
        db, pending_profile_id, request.extracted_data, current_user.id
    )
    return {
        "status": "approved",
        "employee_id": employee.id,
        "profile_complete": employee.profile_complete
    }


@router.post("/review-queue/{pending_profile_id}/reject")
def reject_profile(
    pending_profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_hr_or_management)
) -> dict:
    """Reject resume profile."""
    return service.reject_profile(db, pending_profile_id, current_user.id)
