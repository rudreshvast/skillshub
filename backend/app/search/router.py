import asyncio
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db, get_current_user, require_hr_role
from app.models.user import User
from app.search import service
from app.search.schemas import SearchRequest, SearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.post("/query")
async def search_employees(
    request: SearchRequest,
    current_user: User = Depends(require_hr_role),
    db: Session = Depends(get_db),
) -> SearchResponse:
    try:
        parsed = await asyncio.to_thread(service.parse_query, request.query)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse query, please try again")

    candidates, search_note = await asyncio.to_thread(service.score_employees, parsed, db)

    try:
        explanations = await asyncio.to_thread(service.generate_explanations, request.query, candidates)
    except Exception:
        explanations = {}

    for candidate in candidates:
        candidate.explanation = explanations.get(candidate.employee_id, "Explanation unavailable")

    return SearchResponse(
        query=request.query,
        parsed_query=parsed,
        total_found=len(candidates),
        candidates=candidates,
        search_note=search_note,
    )
