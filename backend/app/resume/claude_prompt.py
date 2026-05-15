SYSTEM_PROMPT = """You are a resume parser for a skills intelligence platform.
Extract structured profile data from the resume text provided.
Return ONLY valid JSON. No explanation, no markdown, no code blocks.
If a field cannot be determined, use null.
For proficiency infer from context:
  - "5+ years", "expert", "led", "architected" → expert
  - "2-4 years", "worked with", "built" → intermediate
  - "familiar", "learning", "exposure", under 1 year → novice
For seniority infer from total experience and roles held."""

USER_PROMPT_TEMPLATE = """Parse this resume and return JSON with exactly this structure:
{{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "current_role": "",
  "seniority": "junior|mid|senior|lead|principal",
  "years_of_experience": 0,
  "summary": "",
  "skills": [
    {{
      "name": "",
      "category": "language|framework|platform|tool|domain",
      "proficiency": "novice|intermediate|expert",
      "years": 0
    }}
  ],
  "inferred_skills": [
    {{
      "name": "",
      "inferred_from": "",
      "confidence": 0.95,
      "category": "language|framework|platform|tool|domain"
    }}
  ],
  "projects": [
    {{
      "name": "",
      "role": "",
      "duration": "",
      "domain": "",
      "technologies": []
    }}
  ],
  "certifications": [
    {{
      "name": "",
      "issuer": "",
      "issued_on": ""
    }}
  ],
  "domain_expertise": []
}}

Skill inference rules:
- Has Next.js → infer React (0.98), JavaScript (0.95)
- Has React → infer JavaScript (0.98)
- Has Angular → infer TypeScript (0.90)
- Has Kubernetes → infer Docker (0.95)
- Has Spring Boot → infer Java (0.98)
- Has Django → infer Python (0.98)
- Has Rails → infer Ruby (0.98)
- Has NestJS → infer Node.js (0.95)
- Has Express → infer Node.js (0.98)
- Has Pandas or NumPy → infer Python (0.99)
- Has TensorFlow or PyTorch → infer Python (0.99)
Only infer skills NOT already explicitly listed.
Strip endorsement counts from LinkedIn exports
(e.g. "Python · 47 endorsements" → "Python").
Deduplicate skills — keep highest proficiency.

Resume text:
{raw_text}"""
