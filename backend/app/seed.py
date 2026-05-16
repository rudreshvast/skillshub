"""
Seed script for SkillsHub database.
Creates 2 HR users and 17 employees across 5 departments with realistic skills and projects.

Run with: cd backend && python -m app.seed
"""

from datetime import date
from app.db.database import SessionLocal
from app.models.user import User
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.models.employee_project import EmployeeProject
from app.auth.utils import hash_password


# HR Users (no Employee records needed)
SEED_USERS = [
    {
        "email": "hr@skillshub.com",
        "name": "Priya Sharma",
        "role": "hr",
    },
    {
        "email": "hr2@skillshub.com",
        "name": "Anita Desai",
        "role": "hr",
    },
]

# Employees with nested skills and projects
SEED_EMPLOYEES = [
    {
        "email": "arjun.mehta@skillshub.com",
        "name": "Arjun Mehta",
        "employee_id": "EMP001",
        "designation": "CTO",
        "department": "Management",
        "location": "Mumbai",
        "work_mode": "hybrid",
        "seniority": "principal",
        "dob": date(1987, 3, 15),
        "date_of_joining": date(2018, 6, 1),
        "years_of_experience": 18,
        "domain_expertise": ["Cloud Architecture", "Engineering Leadership", "Product Strategy"],
        "summary": "Seasoned technology leader with 18 years driving engineering excellence across fintech and SaaS products.",
        "skills": [
            {"skill_name": "Cloud Architecture", "category": "domain", "proficiency": "expert", "years": 12},
            {"skill_name": "System Design", "category": "domain", "proficiency": "expert", "years": 15},
            {"skill_name": "Python", "category": "language", "proficiency": "expert", "years": 14},
            {"skill_name": "AWS", "category": "platform", "proficiency": "expert", "years": 10},
            {"skill_name": "Kubernetes", "category": "platform", "proficiency": "expert", "years": 7},
            {"skill_name": "Engineering Leadership", "category": "domain", "proficiency": "expert", "years": 10},
            {"skill_name": "Microservices", "category": "domain", "proficiency": "expert", "years": 9},
        ],
        "projects": [
            {
                "name": "FinPay Platform Redesign",
                "role": "CTO",
                "duration": "18 months",
                "domain": "Fintech",
                "technologies": ["AWS", "Kubernetes", "Python", "PostgreSQL"],
            },
            {
                "name": "Data Platform Modernisation",
                "role": "Technical Sponsor",
                "duration": "12 months",
                "domain": "Data Engineering",
                "technologies": ["Spark", "Kafka", "AWS S3", "dbt"],
            },
        ],
    },
    {
        "email": "neha.kapoor@skillshub.com",
        "name": "Neha Kapoor",
        "employee_id": "EMP002",
        "designation": "CFO",
        "department": "Management",
        "location": "Bangalore",
        "work_mode": "hybrid",
        "seniority": "principal",
        "dob": date(1988, 7, 22),
        "date_of_joining": date(2019, 3, 15),
        "years_of_experience": 16,
        "domain_expertise": ["Financial Planning", "SaaS Metrics", "Investor Relations"],
        "summary": "Finance leader with deep expertise in SaaS financial modelling and strategic planning.",
        "skills": [
            {"skill_name": "Financial Modelling", "category": "domain", "proficiency": "expert", "years": 14},
            {"skill_name": "SaaS Metrics", "category": "domain", "proficiency": "expert", "years": 8},
            {"skill_name": "Excel / Sheets", "category": "tool", "proficiency": "expert", "years": 16},
            {"skill_name": "SQL", "category": "language", "proficiency": "intermediate", "years": 6},
            {"skill_name": "Tableau", "category": "tool", "proficiency": "intermediate", "years": 4},
        ],
        "projects": [
            {
                "name": "Annual Budget Planning FY25",
                "role": "CFO",
                "duration": "3 months",
                "domain": "Finance",
                "technologies": ["Excel", "Tableau", "SQL"],
            },
        ],
    },
    {
        "email": "rahul.singh@skillshub.com",
        "name": "Rahul Singh",
        "employee_id": "EMP003",
        "designation": "Delivery Head",
        "department": "Management",
        "location": "Hyderabad",
        "work_mode": "hybrid",
        "seniority": "principal",
        "dob": date(1989, 5, 10),
        "date_of_joining": date(2017, 9, 1),
        "years_of_experience": 14,
        "domain_expertise": ["Project Delivery", "Client Management", "Agile Transformation"],
        "summary": "Delivery leader ensuring on-time, on-budget project execution for enterprise clients.",
        "skills": [
            {"skill_name": "Agile / Scrum", "category": "domain", "proficiency": "expert", "years": 10},
            {"skill_name": "Project Management", "category": "domain", "proficiency": "expert", "years": 14},
            {"skill_name": "Risk Management", "category": "domain", "proficiency": "expert", "years": 8},
            {"skill_name": "JIRA", "category": "tool", "proficiency": "expert", "years": 10},
            {"skill_name": "Stakeholder Management", "category": "domain", "proficiency": "expert", "years": 12},
        ],
        "projects": [
            {
                "name": "Enterprise ERP Rollout",
                "role": "Delivery Head",
                "duration": "24 months",
                "domain": "Enterprise Software",
                "technologies": ["SAP", "JIRA", "Confluence"],
            },
            {
                "name": "Healthcare Portal v2",
                "role": "Delivery Head",
                "duration": "10 months",
                "domain": "Healthcare",
                "technologies": ["JIRA", "Confluence", "Slack"],
            },
        ],
    },
    {
        "email": "kavita.nair@skillshub.com",
        "name": "Kavita Nair",
        "employee_id": "EMP004",
        "designation": "Project Manager",
        "department": "Management",
        "location": "Pune",
        "work_mode": "onsite",
        "seniority": "senior",
        "dob": date(1992, 11, 8),
        "date_of_joining": date(2020, 2, 15),
        "years_of_experience": 9,
        "domain_expertise": ["Agile Delivery", "E-commerce"],
        "summary": "Project Manager specialising in agile delivery for e-commerce and retail platforms.",
        "skills": [
            {"skill_name": "Project Management", "category": "domain", "proficiency": "expert", "years": 9},
            {"skill_name": "Agile / Scrum", "category": "domain", "proficiency": "expert", "years": 7},
            {"skill_name": "JIRA", "category": "tool", "proficiency": "expert", "years": 8},
            {"skill_name": "Risk Management", "category": "domain", "proficiency": "intermediate", "years": 5},
            {"skill_name": "SQL", "category": "language", "proficiency": "intermediate", "years": 4},
        ],
        "projects": [
            {
                "name": "RetailEdge Mobile App",
                "role": "Project Manager",
                "duration": "8 months",
                "domain": "E-commerce",
                "technologies": ["React Native", "Node.js", "MongoDB", "JIRA"],
            },
        ],
    },
    {
        "email": "vikram.joshi@skillshub.com",
        "name": "Vikram Joshi",
        "employee_id": "EMP005",
        "designation": "Project Manager",
        "department": "Management",
        "location": "Chennai",
        "work_mode": "hybrid",
        "seniority": "senior",
        "dob": date(1993, 2, 20),
        "date_of_joining": date(2021, 5, 10),
        "years_of_experience": 8,
        "domain_expertise": ["Fintech", "Banking"],
        "summary": "Experienced PM delivering complex fintech integrations and banking platform projects.",
        "skills": [
            {"skill_name": "Project Management", "category": "domain", "proficiency": "expert", "years": 8},
            {"skill_name": "Agile / Scrum", "category": "domain", "proficiency": "expert", "years": 6},
            {"skill_name": "JIRA", "category": "tool", "proficiency": "expert", "years": 7},
            {"skill_name": "Confluence", "category": "tool", "proficiency": "expert", "years": 6},
            {"skill_name": "Python", "category": "language", "proficiency": "novice", "years": 2},
        ],
        "projects": [
            {
                "name": "UPI Payment Gateway Integration",
                "role": "Project Manager",
                "duration": "6 months",
                "domain": "Fintech",
                "technologies": ["REST APIs", "PostgreSQL", "JIRA", "Postman"],
            },
        ],
    },
    # Development Department
    {
        "email": "siddharth.rao@skillshub.com",
        "name": "Siddharth Rao",
        "employee_id": "EMP006",
        "designation": "Architect",
        "department": "Development",
        "location": "Bangalore",
        "work_mode": "remote",
        "seniority": "principal",
        "dob": date(1986, 8, 12),
        "date_of_joining": date(2018, 1, 15),
        "years_of_experience": 13,
        "domain_expertise": ["Distributed Systems", "API Design", "Cloud Native"],
        "summary": "Principal architect with deep expertise in distributed systems and cloud-native API platforms.",
        "skills": [
            {"skill_name": "System Design", "category": "domain", "proficiency": "expert", "years": 11},
            {"skill_name": "Python", "category": "language", "proficiency": "expert", "years": 12},
            {"skill_name": "Go", "category": "language", "proficiency": "expert", "years": 6},
            {"skill_name": "AWS", "category": "platform", "proficiency": "expert", "years": 9},
            {"skill_name": "gRPC / REST", "category": "domain", "proficiency": "expert", "years": 8},
            {"skill_name": "PostgreSQL", "category": "platform", "proficiency": "expert", "years": 10},
            {"skill_name": "Kafka", "category": "platform", "proficiency": "expert", "years": 5},
        ],
        "projects": [
            {
                "name": "API Gateway Platform",
                "role": "Lead Architect",
                "duration": "14 months",
                "domain": "Platform Engineering",
                "technologies": ["Go", "gRPC", "Kafka", "AWS", "PostgreSQL"],
            },
            {
                "name": "Microservices Migration",
                "role": "Solutions Architect",
                "duration": "10 months",
                "domain": "Cloud Native",
                "technologies": ["Python", "Docker", "Kubernetes", "AWS"],
            },
        ],
    },
    {
        "email": "meera.iyer@skillshub.com",
        "name": "Meera Iyer",
        "employee_id": "EMP007",
        "designation": "Architect",
        "department": "Development",
        "location": "Hyderabad",
        "work_mode": "hybrid",
        "seniority": "principal",
        "dob": date(1987, 12, 3),
        "date_of_joining": date(2019, 7, 1),
        "years_of_experience": 11,
        "domain_expertise": ["Frontend Architecture", "Design Systems", "Performance Engineering"],
        "summary": "Frontend architect driving design systems and web performance across large-scale SaaS products.",
        "skills": [
            {"skill_name": "React", "category": "framework", "proficiency": "expert", "years": 9},
            {"skill_name": "TypeScript", "category": "language", "proficiency": "expert", "years": 7},
            {"skill_name": "Next.js", "category": "framework", "proficiency": "expert", "years": 5},
            {"skill_name": "JavaScript", "category": "language", "proficiency": "expert", "years": 11},
            {"skill_name": "Design Systems", "category": "domain", "proficiency": "expert", "years": 6},
            {"skill_name": "Web Performance", "category": "domain", "proficiency": "expert", "years": 7},
            {"skill_name": "GraphQL", "category": "platform", "proficiency": "expert", "years": 4},
        ],
        "projects": [
            {
                "name": "Design System v2 — Nebula",
                "role": "Frontend Architect",
                "duration": "12 months",
                "domain": "Platform Engineering",
                "technologies": ["React", "TypeScript", "Storybook", "Figma"],
            },
            {
                "name": "SaaS Dashboard Rewrite",
                "role": "Lead Frontend",
                "duration": "8 months",
                "domain": "SaaS",
                "technologies": ["Next.js", "TypeScript", "GraphQL", "TailwindCSS"],
            },
        ],
    },
    {
        "email": "amit.verma@skillshub.com",
        "name": "Amit Verma",
        "employee_id": "EMP008",
        "designation": "Developer",
        "department": "Development",
        "location": "Mumbai",
        "work_mode": "hybrid",
        "seniority": "senior",
        "dob": date(1991, 4, 18),
        "date_of_joining": date(2020, 3, 1),
        "years_of_experience": 7,
        "domain_expertise": ["Full Stack Development", "Fintech"],
        "summary": "Senior full-stack developer building payment and fintech products with React and Node.",
        "skills": [
            {"skill_name": "React", "category": "framework", "proficiency": "expert", "years": 6},
            {"skill_name": "Node.js", "category": "framework", "proficiency": "expert", "years": 6},
            {"skill_name": "TypeScript", "category": "language", "proficiency": "expert", "years": 5},
            {"skill_name": "PostgreSQL", "category": "platform", "proficiency": "expert", "years": 5},
            {"skill_name": "Docker", "category": "tool", "proficiency": "intermediate", "years": 3},
            {"skill_name": "Redis", "category": "platform", "proficiency": "intermediate", "years": 3},
        ],
        "projects": [
            {
                "name": "FinPay Checkout SDK",
                "role": "Senior Developer",
                "duration": "6 months",
                "domain": "Fintech",
                "technologies": ["React", "Node.js", "TypeScript", "PostgreSQL"],
            },
        ],
    },
    {
        "email": "pooja.reddy@skillshub.com",
        "name": "Pooja Reddy",
        "employee_id": "EMP009",
        "designation": "Developer",
        "department": "Development",
        "location": "Bangalore",
        "work_mode": "remote",
        "seniority": "mid",
        "dob": date(1996, 9, 7),
        "date_of_joining": date(2021, 8, 15),
        "years_of_experience": 4,
        "domain_expertise": ["Backend Development", "Healthcare IT"],
        "summary": "Backend developer focused on building reliable APIs for healthcare and wellness platforms.",
        "skills": [
            {"skill_name": "Python", "category": "language", "proficiency": "expert", "years": 4},
            {"skill_name": "FastAPI", "category": "framework", "proficiency": "expert", "years": 3},
            {"skill_name": "PostgreSQL", "category": "platform", "proficiency": "intermediate", "years": 3},
            {"skill_name": "Docker", "category": "tool", "proficiency": "intermediate", "years": 2},
            {"skill_name": "REST APIs", "category": "domain", "proficiency": "expert", "years": 4},
            {"skill_name": "SQLAlchemy", "category": "framework", "proficiency": "intermediate", "years": 3},
        ],
        "projects": [
            {
                "name": "HealthTrack API v3",
                "role": "Backend Developer",
                "duration": "9 months",
                "domain": "Healthcare",
                "technologies": ["Python", "FastAPI", "PostgreSQL", "Docker"],
            },
        ],
    },
    {
        "email": "rohan.kumar@skillshub.com",
        "name": "Rohan Kumar",
        "employee_id": "EMP010",
        "designation": "Developer",
        "department": "Development",
        "location": "Pune",
        "work_mode": "onsite",
        "seniority": "junior",
        "dob": date(2000, 1, 25),
        "date_of_joining": date(2022, 7, 1),
        "years_of_experience": 2,
        "domain_expertise": ["Frontend Development"],
        "summary": "Junior frontend developer with hands-on React experience in e-commerce and consumer apps.",
        "skills": [
            {"skill_name": "React", "category": "framework", "proficiency": "intermediate", "years": 2},
            {"skill_name": "JavaScript", "category": "language", "proficiency": "intermediate", "years": 2},
            {"skill_name": "HTML / CSS", "category": "language", "proficiency": "expert", "years": 3},
            {"skill_name": "Tailwind CSS", "category": "framework", "proficiency": "intermediate", "years": 1},
            {"skill_name": "Git", "category": "tool", "proficiency": "intermediate", "years": 2},
        ],
        "projects": [
            {
                "name": "RetailEdge Mobile App",
                "role": "Frontend Developer",
                "duration": "5 months",
                "domain": "E-commerce",
                "technologies": ["React", "JavaScript", "TailwindCSS"],
            },
        ],
    },
    # Quality Assurance Department
    {
        "email": "sunita.pillai@skillshub.com",
        "name": "Sunita Pillai",
        "employee_id": "EMP011",
        "designation": "QA Analyst",
        "department": "Quality Assurance",
        "location": "Chennai",
        "work_mode": "hybrid",
        "seniority": "senior",
        "dob": date(1990, 6, 14),
        "date_of_joining": date(2019, 11, 1),
        "years_of_experience": 6,
        "domain_expertise": ["Test Automation", "API Testing"],
        "summary": "QA engineer specialising in test automation frameworks and API contract testing.",
        "skills": [
            {"skill_name": "Selenium", "category": "tool", "proficiency": "expert", "years": 5},
            {"skill_name": "Cypress", "category": "tool", "proficiency": "expert", "years": 4},
            {"skill_name": "Python", "category": "language", "proficiency": "intermediate", "years": 4},
            {"skill_name": "Postman", "category": "tool", "proficiency": "expert", "years": 5},
            {"skill_name": "JIRA", "category": "tool", "proficiency": "expert", "years": 6},
            {"skill_name": "API Testing", "category": "domain", "proficiency": "expert", "years": 5},
        ],
        "projects": [
            {
                "name": "HealthTrack API v3",
                "role": "QA Lead",
                "duration": "9 months",
                "domain": "Healthcare",
                "technologies": ["Cypress", "Postman", "Python", "JIRA"],
            },
        ],
    },
    {
        "email": "deepak.malhotra@skillshub.com",
        "name": "Deepak Malhotra",
        "employee_id": "EMP012",
        "designation": "QA Analyst",
        "department": "Quality Assurance",
        "location": "Mumbai",
        "work_mode": "onsite",
        "seniority": "mid",
        "dob": date(1995, 10, 5),
        "date_of_joining": date(2022, 1, 10),
        "years_of_experience": 3,
        "domain_expertise": ["Manual Testing", "Mobile QA"],
        "summary": "QA analyst experienced in manual and exploratory testing for mobile and web products.",
        "skills": [
            {"skill_name": "Manual Testing", "category": "domain", "proficiency": "expert", "years": 3},
            {"skill_name": "Selenium", "category": "tool", "proficiency": "intermediate", "years": 2},
            {"skill_name": "JIRA", "category": "tool", "proficiency": "expert", "years": 3},
            {"skill_name": "TestRail", "category": "tool", "proficiency": "intermediate", "years": 2},
            {"skill_name": "Mobile Testing", "category": "domain", "proficiency": "expert", "years": 2},
        ],
        "projects": [
            {
                "name": "RetailEdge Mobile App",
                "role": "QA Analyst",
                "duration": "5 months",
                "domain": "E-commerce",
                "technologies": ["JIRA", "TestRail", "Appium"],
            },
        ],
    },
    # Design Department
    {
        "email": "ananya.bose@skillshub.com",
        "name": "Ananya Bose",
        "employee_id": "EMP013",
        "designation": "UI/UX Designer",
        "department": "Design",
        "location": "Bangalore",
        "work_mode": "remote",
        "seniority": "senior",
        "dob": date(1991, 5, 28),
        "date_of_joining": date(2020, 4, 1),
        "years_of_experience": 6,
        "domain_expertise": ["Product Design", "Design Systems", "User Research"],
        "summary": "Senior UX designer crafting intuitive product experiences with a strong research foundation.",
        "skills": [
            {"skill_name": "Figma", "category": "tool", "proficiency": "expert", "years": 5},
            {"skill_name": "User Research", "category": "domain", "proficiency": "expert", "years": 5},
            {"skill_name": "Prototyping", "category": "domain", "proficiency": "expert", "years": 6},
            {"skill_name": "Design Systems", "category": "domain", "proficiency": "expert", "years": 4},
            {"skill_name": "Interaction Design", "category": "domain", "proficiency": "expert", "years": 6},
            {"skill_name": "Adobe XD", "category": "tool", "proficiency": "intermediate", "years": 3},
        ],
        "projects": [
            {
                "name": "Design System v2 — Nebula",
                "role": "Lead Designer",
                "duration": "12 months",
                "domain": "Platform Engineering",
                "technologies": ["Figma", "Storybook", "Zeroheight"],
            },
            {
                "name": "SaaS Dashboard Rewrite",
                "role": "UX Designer",
                "duration": "8 months",
                "domain": "SaaS",
                "technologies": ["Figma", "Maze", "Hotjar"],
            },
        ],
    },
    {
        "email": "kiran.thomas@skillshub.com",
        "name": "Kiran Thomas",
        "employee_id": "EMP014",
        "designation": "UI/UX Designer",
        "department": "Design",
        "location": "Kochi",
        "work_mode": "remote",
        "seniority": "mid",
        "dob": date(1997, 8, 11),
        "date_of_joining": date(2021, 9, 15),
        "years_of_experience": 3,
        "domain_expertise": ["Mobile UX", "E-commerce Design"],
        "summary": "Mid-level product designer focused on mobile UX and conversion-optimised e-commerce flows.",
        "skills": [
            {"skill_name": "Figma", "category": "tool", "proficiency": "expert", "years": 3},
            {"skill_name": "Prototyping", "category": "domain", "proficiency": "intermediate", "years": 3},
            {"skill_name": "Mobile UX", "category": "domain", "proficiency": "expert", "years": 3},
            {"skill_name": "Sketch", "category": "tool", "proficiency": "intermediate", "years": 2},
            {"skill_name": "User Research", "category": "domain", "proficiency": "intermediate", "years": 2},
        ],
        "projects": [
            {
                "name": "RetailEdge Mobile App",
                "role": "UI/UX Designer",
                "duration": "8 months",
                "domain": "E-commerce",
                "technologies": ["Figma", "Zeplin", "Maze"],
            },
        ],
    },
    # DevOps Department
    {
        "email": "nikhil.agarwal@skillshub.com",
        "name": "Nikhil Agarwal",
        "employee_id": "EMP015",
        "designation": "DevOps Engineer",
        "department": "DevOps",
        "location": "Hyderabad",
        "work_mode": "hybrid",
        "seniority": "senior",
        "dob": date(1989, 2, 19),
        "date_of_joining": date(2019, 10, 1),
        "years_of_experience": 7,
        "domain_expertise": ["Cloud Infrastructure", "CI/CD", "Platform Engineering"],
        "summary": "Senior DevOps engineer building reliable cloud infrastructure and automated delivery pipelines.",
        "skills": [
            {"skill_name": "Kubernetes", "category": "platform", "proficiency": "expert", "years": 5},
            {"skill_name": "Docker", "category": "tool", "proficiency": "expert", "years": 6},
            {"skill_name": "Terraform", "category": "tool", "proficiency": "expert", "years": 5},
            {"skill_name": "AWS", "category": "platform", "proficiency": "expert", "years": 6},
            {"skill_name": "GitHub Actions", "category": "tool", "proficiency": "expert", "years": 4},
            {"skill_name": "Prometheus / Grafana", "category": "tool", "proficiency": "intermediate", "years": 3},
            {"skill_name": "Linux", "category": "platform", "proficiency": "expert", "years": 7},
        ],
        "projects": [
            {
                "name": "API Gateway Platform",
                "role": "DevOps Lead",
                "duration": "14 months",
                "domain": "Platform Engineering",
                "technologies": ["Kubernetes", "Terraform", "AWS", "GitHub Actions"],
            },
            {
                "name": "Microservices Migration",
                "role": "Infrastructure Engineer",
                "duration": "10 months",
                "domain": "Cloud Native",
                "technologies": ["Docker", "Kubernetes", "AWS", "Terraform"],
            },
        ],
    },
    {
        "email": "preethi.menon@skillshub.com",
        "name": "Preethi Menon",
        "employee_id": "EMP016",
        "designation": "DevOps Engineer",
        "department": "DevOps",
        "location": "Mumbai",
        "work_mode": "remote",
        "seniority": "mid",
        "dob": date(1994, 11, 30),
        "date_of_joining": date(2021, 6, 1),
        "years_of_experience": 4,
        "domain_expertise": ["CI/CD Pipelines", "Container Orchestration"],
        "summary": "DevOps engineer specialising in CI/CD automation and container orchestration for SaaS teams.",
        "skills": [
            {"skill_name": "Docker", "category": "tool", "proficiency": "expert", "years": 4},
            {"skill_name": "Kubernetes", "category": "platform", "proficiency": "intermediate", "years": 3},
            {"skill_name": "Jenkins", "category": "tool", "proficiency": "expert", "years": 4},
            {"skill_name": "Ansible", "category": "tool", "proficiency": "intermediate", "years": 3},
            {"skill_name": "AWS", "category": "platform", "proficiency": "intermediate", "years": 3},
            {"skill_name": "Python", "category": "language", "proficiency": "intermediate", "years": 3},
        ],
        "projects": [
            {
                "name": "FinPay Platform Redesign",
                "role": "DevOps Engineer",
                "duration": "12 months",
                "domain": "Fintech",
                "technologies": ["Docker", "Jenkins", "AWS", "Ansible"],
            },
        ],
    },
    {
        "email": "sanjay.gupte@skillshub.com",
        "name": "Sanjay Gupte",
        "employee_id": "EMP017",
        "designation": "DevOps Engineer",
        "department": "DevOps",
        "location": "Pune",
        "work_mode": "onsite",
        "seniority": "junior",
        "dob": date(1998, 7, 16),
        "date_of_joining": date(2023, 3, 1),
        "years_of_experience": 2,
        "domain_expertise": ["Cloud Operations"],
        "summary": "Junior DevOps engineer learning cloud operations and supporting production deployments.",
        "skills": [
            {"skill_name": "Docker", "category": "tool", "proficiency": "intermediate", "years": 2},
            {"skill_name": "Linux", "category": "platform", "proficiency": "intermediate", "years": 2},
            {"skill_name": "AWS", "category": "platform", "proficiency": "novice", "years": 1},
            {"skill_name": "Git", "category": "tool", "proficiency": "intermediate", "years": 2},
            {"skill_name": "Bash scripting", "category": "language", "proficiency": "intermediate", "years": 2},
        ],
        "projects": [
            {
                "name": "SaaS Dashboard Rewrite",
                "role": "DevOps Support",
                "duration": "8 months",
                "domain": "SaaS",
                "technologies": ["Docker", "AWS", "Linux"],
            },
        ],
    },
]


def seed_hr_users(db):
    """Create HR user accounts."""
    created = 0
    skipped = 0

    for user_data in SEED_USERS:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            skipped += 1
            continue

        user = User(
            email=user_data["email"],
            hashed_password=hash_password("Skillshub@123"),
            name=user_data["name"],
            role=user_data["role"],
            is_active=True,
        )
        db.add(user)
        created += 1

    db.flush()
    return created, skipped


def seed_employees(db):
    """Create employee accounts with skills and projects."""
    created = 0
    skipped = 0

    for emp_data in SEED_EMPLOYEES:
        existing_user = db.query(User).filter(User.email == emp_data["email"]).first()
        existing_emp = db.query(Employee).filter(Employee.employee_id == emp_data["employee_id"]).first()
        if existing_user or existing_emp:
            skipped += 1
            continue

        # Create User
        user = User(
            email=emp_data["email"],
            hashed_password=hash_password("Skillshub@123"),
            name=emp_data["name"],
            role="employee",
            is_active=True,
        )
        db.add(user)
        db.flush()

        # Create Employee
        employee = Employee(
            user_id=user.id,
            employee_id=emp_data["employee_id"],
            name=emp_data["name"],
            dob=emp_data["dob"],
            date_of_joining=emp_data["date_of_joining"],
            designation=emp_data["designation"],
            department=emp_data["department"],
            location=emp_data["location"],
            work_mode=emp_data["work_mode"],
            seniority=emp_data["seniority"],
            profile_complete=True,
            summary=emp_data.get("summary"),
            years_of_experience=emp_data.get("years_of_experience"),
            domain_expertise=emp_data.get("domain_expertise"),
        )
        db.add(employee)
        db.flush()

        # Create Skills
        for skill_data in emp_data.get("skills", []):
            skill = EmployeeSkill(
                employee_id=employee.id,
                skill_name=skill_data["skill_name"],
                category=skill_data["category"],
                proficiency=skill_data["proficiency"],
                years=skill_data.get("years"),
                is_inferred=False,
                confidence_score=None,
            )
            db.add(skill)

        # Create Projects
        for project_data in emp_data.get("projects", []):
            project = EmployeeProject(
                employee_id=employee.id,
                name=project_data["name"],
                role=project_data.get("role"),
                duration=project_data.get("duration"),
                domain=project_data.get("domain"),
                technologies=project_data.get("technologies"),
            )
            db.add(project)

        db.flush()
        created += 1

    return created, skipped


def main():
    db = SessionLocal()
    try:
        print("🌱 Starting database seed...")

        # Seed HR users
        hr_created, hr_skipped = seed_hr_users(db)
        print(f"  ✓ HR users: {hr_created} created, {hr_skipped} skipped")

        # Seed employees
        emp_created, emp_skipped = seed_employees(db)
        print(f"  ✓ Employees: {emp_created} created, {emp_skipped} skipped")

        # Commit transaction
        db.commit()

        total_users = hr_created + emp_created
        print(f"\n✅ Seeded successfully!")
        print(f"   {total_users} users created ({hr_created} HR + {emp_created} employees)")
        print(f"   {hr_skipped + emp_skipped} users skipped (already exist)")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
