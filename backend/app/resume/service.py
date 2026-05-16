import os
import json
import pdfplumber
from datetime import datetime
from typing import Optional, Dict
from sqlalchemy.orm import Session
from openai import OpenAI

from app.models.pending_profile import PendingProfile
from app.models.employee_skill import EmployeeSkill
from app.models.employee_project import EmployeeProject
from app.models.employee_certification import EmployeeCertification
from app.models.employee import Employee
from app.resume.claude_prompt import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from fastapi import HTTPException, status


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF using pdfplumber."""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )


def call_claude_api(raw_text: str) -> dict:
    """Call OpenAI API to extract profile data from resume text."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OPENAI_API_KEY not configured"
        )

    client = OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=4000,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": USER_PROMPT_TEMPLATE.format(raw_text=raw_text)
                }
            ]
        )

        # Extract JSON from response
        response_text = response.choices[0].message.content

        # Try to parse as JSON
        try:
            extracted_data = json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code blocks
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                extracted_data = json.loads(response_text[json_start:json_end])
            elif "```" in response_text:
                json_start = response_text.find("```") + 3
                json_end = response_text.find("```", json_start)
                extracted_data = json.loads(response_text[json_start:json_end])
            else:
                raise ValueError("Could not parse OpenAI response as JSON")

        return extracted_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract profile from resume: {str(e)}"
        )


def get_or_create_employee_pending_profile(
    db: Session, employee_id: int, extracted_data: dict, pdf_path: str
) -> PendingProfile:
    """Create or update pending profile for employee."""
    # Check if employee has existing pending profile
    existing = db.query(PendingProfile).filter(
        PendingProfile.employee_id == employee_id
    ).first()

    if existing:
        # Update existing profile
        existing.extracted_data = extracted_data
        existing.original_pdf_path = pdf_path
        existing.status = "pending"
        existing.uploaded_at = datetime.utcnow()
        existing.reviewed_at = None
        existing.reviewed_by = None
        db.flush()
        return existing
    else:
        # Create new profile
        profile = PendingProfile(
            employee_id=employee_id,
            extracted_data=extracted_data,
            original_pdf_path=pdf_path,
            status="pending",
            uploaded_at=datetime.utcnow()
        )
        db.add(profile)
        db.flush()
        return profile


def get_review_queue(db: Session) -> list:
    """Get all pending profiles with employee info."""
    pending = db.query(
        PendingProfile,
        Employee.name.label("employee_name"),
        Employee.designation,
        Employee.department
    ).join(Employee, PendingProfile.employee_id == Employee.id).filter(
        PendingProfile.status == "pending"
    ).order_by(PendingProfile.uploaded_at.asc()).all()

    # Convert to list of dicts for easier access
    result = []
    for row in pending:
        profile = row[0]
        result.append({
            "id": profile.id,
            "employee_id": profile.employee_id,
            "extracted_data": profile.extracted_data,
            "original_pdf_path": profile.original_pdf_path,
            "status": profile.status,
            "uploaded_at": profile.uploaded_at,
            "uploaded_by": profile.uploaded_by,
            "reviewed_at": profile.reviewed_at,
            "employee_name": row[1],
            "designation": row[2],
            "department": row[3]
        })

    return result


def approve_profile(
    db: Session, pending_profile_id: int, extracted_data: dict, reviewer_id: int
) -> Employee:
    """Approve profile and write extracted data to DB."""
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

    try:
        # Delete existing skills/projects/certs for this employee
        db.query(EmployeeSkill).filter(EmployeeSkill.employee_id == employee.id).delete()
        db.query(EmployeeProject).filter(EmployeeProject.employee_id == employee.id).delete()
        db.query(EmployeeCertification).filter(EmployeeCertification.employee_id == employee.id).delete()

        # Insert skills
        if extracted_data.get("skills"):
            for skill in extracted_data["skills"]:
                db.add(EmployeeSkill(
                    employee_id=employee.id,
                    skill_name=skill.get("name", ""),
                    category=skill.get("category", ""),
                    proficiency=skill.get("proficiency", ""),
                    years=skill.get("years"),
                    is_inferred=False
                ))

        # Insert inferred skills
        if extracted_data.get("inferred_skills"):
            for skill in extracted_data["inferred_skills"]:
                db.add(EmployeeSkill(
                    employee_id=employee.id,
                    skill_name=skill.get("name", ""),
                    category=skill.get("category", ""),
                    proficiency="intermediate",  # Default for inferred
                    years=None,
                    is_inferred=True,
                    confidence_score=skill.get("confidence")
                ))

        # Insert projects
        if extracted_data.get("projects"):
            for project in extracted_data["projects"]:
                db.add(EmployeeProject(
                    employee_id=employee.id,
                    name=project.get("name", ""),
                    role=project.get("role"),
                    duration=project.get("duration"),
                    domain=project.get("domain"),
                    technologies=project.get("technologies")
                ))

        # Insert certifications
        if extracted_data.get("certifications"):
            for cert in extracted_data["certifications"]:
                db.add(EmployeeCertification(
                    employee_id=employee.id,
                    name=cert.get("name", ""),
                    issuer=cert.get("issuer"),
                    issued_on=cert.get("issued_on")
                ))

        # Update employee record
        employee.summary = extracted_data.get("summary")
        employee.years_of_experience = extracted_data.get("years_of_experience")
        employee.domain_expertise = extracted_data.get("domain_expertise")
        if extracted_data.get("seniority"):
            employee.seniority = extracted_data["seniority"]
        employee.profile_complete = True

        # Update pending profile
        profile.status = "approved"
        profile.reviewed_at = datetime.utcnow()
        profile.reviewed_by = reviewer_id

        db.commit()
        return employee
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to approve profile: {str(e)}"
        )


def reject_profile(
    db: Session, pending_profile_id: int, reviewer_id: int
) -> dict:
    """Reject profile."""
    profile = db.query(PendingProfile).filter(
        PendingProfile.id == pending_profile_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    try:
        profile.status = "rejected"
        profile.reviewed_at = datetime.utcnow()
        profile.reviewed_by = reviewer_id
        db.commit()
        return {"status": "rejected"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to reject profile: {str(e)}"
        )
