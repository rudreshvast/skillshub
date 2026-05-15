import os
import json
from typing import Optional
from sqlalchemy.orm import Session
from openai import OpenAI

from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.search.schemas import (
    ParsedQuery,
    CandidateResult,
    SkillMatch,
    SearchResponse,
)
from app.search.prompts import (
    QUERY_SYSTEM_PROMPT,
    QUERY_USER_TEMPLATE,
    EXPLAIN_SYSTEM_PROMPT,
    EXPLAIN_USER_TEMPLATE,
)


def parse_query(query: str) -> ParsedQuery:
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1000,
        messages=[
            {"role": "system", "content": QUERY_SYSTEM_PROMPT},
            {"role": "user", "content": QUERY_USER_TEMPLATE.format(query=query)},
        ],
    )

    response_text = response.choices[0].message.content

    try:
        data = json.loads(response_text)
    except json.JSONDecodeError:
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            data = json.loads(response_text[json_start:json_end])
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            data = json.loads(response_text[json_start:json_end])
        else:
            raise ValueError("Could not parse OpenAI response as JSON")

    return ParsedQuery(**data)


def score_employees(parsed: ParsedQuery, db: Session) -> tuple[list[CandidateResult], Optional[str]]:
    seniority_levels = ["junior", "mid", "senior", "lead", "principal"]

    employees = db.query(Employee).filter(Employee.profile_complete == True).all()
    if not employees:
        return ([], "No employees matched your query. Try broader skill terms.")

    employee_ids = [e.id for e in employees]
    skills = db.query(EmployeeSkill).filter(EmployeeSkill.employee_id.in_(employee_ids)).all()

    skills_by_employee = {}
    for skill in skills:
        if skill.employee_id not in skills_by_employee:
            skills_by_employee[skill.employee_id] = []
        skills_by_employee[skill.employee_id].append(skill)

    results = []

    for employee in employees:
        emp_skills = skills_by_employee.get(employee.id, [])

        skill_score = _calculate_skill_score(parsed, emp_skills)
        seniority_score = _calculate_seniority_score(parsed, employee.seniority, seniority_levels)
        domain_score = _calculate_domain_score(parsed, employee.domain_expertise or [])
        experience_score = _calculate_experience_score(parsed, employee.years_of_experience)

        match_score = round(
            (skill_score * 0.50) + (seniority_score * 0.20) + (domain_score * 0.20) + (experience_score * 0.10),
            1,
        )

        if match_score < 20.0:
            continue

        matched_skills = _get_matched_skills(parsed, emp_skills)
        missing_required = _get_missing_required_skills(parsed, emp_skills)

        result = CandidateResult(
            employee_id=employee.id,
            name=employee.name,
            designation=employee.designation,
            department=employee.department,
            location=employee.location,
            work_mode=employee.work_mode,
            seniority=employee.seniority,
            years_of_experience=employee.years_of_experience,
            domain_expertise=employee.domain_expertise or [],
            profile_complete=employee.profile_complete,
            match_score=match_score,
            skill_score=skill_score,
            seniority_score=seniority_score,
            domain_score=domain_score,
            matched_skills=matched_skills,
            missing_required_skills=missing_required,
            explanation="",
        )
        results.append(result)

    results.sort(key=lambda x: x.match_score, reverse=True)
    results = results[:10]

    search_note = _generate_search_note(results)

    return (results, search_note)


def _calculate_skill_score(parsed: ParsedQuery, emp_skills: list[EmployeeSkill]) -> float:
    if not parsed.required_skills and not parsed.preferred_skills:
        return 100.0

    emp_skill_names = {s.skill_name.lower(): s for s in emp_skills}

    required_score = 0.0
    required_count = len(parsed.required_skills)

    if required_count > 0:
        for skill in parsed.required_skills:
            skill_lower = skill.lower()
            if skill_lower in emp_skill_names:
                emp_skill = emp_skill_names[skill_lower]
                points = 100.0
                if emp_skill.proficiency == "expert":
                    points *= 1.0
                elif emp_skill.proficiency == "intermediate":
                    points *= 0.75
                elif emp_skill.proficiency == "novice":
                    points *= 0.5

                if emp_skill.is_inferred:
                    points *= 0.7

                required_score += points
            else:
                required_score += 0

        required_score = (required_score / (required_count * 100.0)) * 100.0

    preferred_score = 0.0
    preferred_count = len(parsed.preferred_skills)

    if preferred_count > 0:
        for skill in parsed.preferred_skills:
            skill_lower = skill.lower()
            if skill_lower in emp_skill_names:
                emp_skill = emp_skill_names[skill_lower]
                points = 100.0
                if emp_skill.proficiency == "expert":
                    points *= 1.0
                elif emp_skill.proficiency == "intermediate":
                    points *= 0.75
                elif emp_skill.proficiency == "novice":
                    points *= 0.5

                if emp_skill.is_inferred:
                    points *= 0.7

                preferred_score += points
            else:
                preferred_score += 0

        preferred_score = (preferred_score / (preferred_count * 100.0)) * 100.0

    final_score = (required_score * 0.7) + (preferred_score * 0.3)
    return min(100.0, max(0.0, final_score))


def _calculate_seniority_score(parsed: ParsedQuery, emp_seniority: str, levels: list[str]) -> float:
    if parsed.required_seniority is None:
        return 100.0

    required_idx = levels.index(parsed.required_seniority.lower()) if parsed.required_seniority.lower() in levels else None
    emp_idx = levels.index(emp_seniority.lower()) if emp_seniority.lower() in levels else None

    if required_idx is None or emp_idx is None:
        return 50.0

    distance = abs(emp_idx - required_idx)
    if distance == 0:
        return 100.0
    elif distance == 1:
        return 70.0
    elif distance == 2:
        return 40.0
    else:
        return 10.0


def _calculate_domain_score(parsed: ParsedQuery, emp_domains: list[str]) -> float:
    if parsed.domain_preference is None:
        return 100.0

    if not emp_domains:
        return 0.0

    domain_lower = parsed.domain_preference.lower()
    for emp_domain in emp_domains:
        if domain_lower in emp_domain.lower():
            return 100.0

    return 0.0


def _calculate_experience_score(parsed: ParsedQuery, emp_years: Optional[int]) -> float:
    if parsed.min_years_experience is None:
        return 100.0

    if emp_years is None:
        return 50.0

    if emp_years >= parsed.min_years_experience:
        return 100.0
    elif emp_years >= parsed.min_years_experience - 1:
        return 70.0
    elif emp_years >= parsed.min_years_experience - 2:
        return 40.0
    else:
        return 10.0


def _get_matched_skills(parsed: ParsedQuery, emp_skills: list[EmployeeSkill]) -> list[SkillMatch]:
    all_required = {s.lower(): True for s in parsed.required_skills}
    all_preferred = {s.lower(): True for s in parsed.preferred_skills}

    matched = []
    emp_skill_names_lower = {s.skill_name.lower(): s for s in emp_skills}

    for skill_lower, emp_skill in emp_skill_names_lower.items():
        is_required = skill_lower in all_required

        match = SkillMatch(
            skill_name=emp_skill.skill_name,
            proficiency=emp_skill.proficiency,
            years=emp_skill.years,
            is_required=is_required,
            is_inferred=emp_skill.is_inferred,
        )
        matched.append(match)

    return matched


def _get_missing_required_skills(parsed: ParsedQuery, emp_skills: list[EmployeeSkill]) -> list[str]:
    emp_skill_names_lower = {s.skill_name.lower() for s in emp_skills}

    missing = []
    for req_skill in parsed.required_skills:
        if req_skill.lower() not in emp_skill_names_lower:
            missing.append(req_skill)

    return missing


def _generate_search_note(results: list[CandidateResult]) -> Optional[str]:
    if len(results) == 0:
        return "No employees matched your query. Try broader skill terms."

    if all(r.match_score < 50.0 for r in results):
        return "No strong matches found — showing closest available candidates."

    if results[0].match_score < 40.0:
        return "These candidates partially match your requirements and may need upskilling."

    if all(len(r.missing_required_skills) > 0 for r in results):
        return "Note: none of the candidates have all required skills."

    return None


def generate_explanations(query: str, candidates: list[CandidateResult]) -> dict[int, str]:
    if not candidates:
        return {}

    candidates_summary_lines = []
    for c in candidates:
        top_skills = ", ".join([s.skill_name for s in c.matched_skills[:3]])
        domains = ", ".join(c.domain_expertise) if c.domain_expertise else "N/A"
        candidates_summary_lines.append(
            f"ID {c.employee_id}: {c.name}, {c.seniority} {c.designation}, "
            f"{c.years_of_experience or 0}yrs exp, skills: {top_skills}, "
            f"domain: {domains}, score: {c.match_score}%"
        )

    candidates_summary = "\n".join(candidates_summary_lines)

    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=2000,
        messages=[
            {"role": "system", "content": EXPLAIN_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": EXPLAIN_USER_TEMPLATE.format(
                    original_query=query, candidates_summary=candidates_summary
                ),
            },
        ],
    )

    response_text = response.choices[0].message.content

    try:
        explanations_list = json.loads(response_text)
    except json.JSONDecodeError:
        if "```json" in response_text:
            json_start = response_text.find("```json") + 7
            json_end = response_text.find("```", json_start)
            explanations_list = json.loads(response_text[json_start:json_end])
        elif "```" in response_text:
            json_start = response_text.find("```") + 3
            json_end = response_text.find("```", json_start)
            explanations_list = json.loads(response_text[json_start:json_end])
        else:
            return {}

    result_dict = {}
    for item in explanations_list:
        if isinstance(item, dict) and "employee_id" in item and "explanation" in item:
            result_dict[item["employee_id"]] = item["explanation"]

    return result_dict
