from app.db.database import SessionLocal
from app.models.user import User
from app.models.employee import Employee
from app.models.employee_skill import EmployeeSkill
from app.auth.utils import hash_password
from datetime import date


def seed_all():
    db = SessionLocal()

    # 1 HR user
    hr_email = "hr@skillshub.com"
    if not db.query(User).filter(User.email == hr_email).first():
        hr_user = User(
            email=hr_email,
            hashed_password=hash_password("password123"),
            name="HR Admin",
            role="hr",
            is_active=True,
        )
        db.add(hr_user)
        db.commit()

    # Management team (5 employees)
    management_employees = [
        {
            "email": "cto@skillshub.com",
            "name": "Alex Chen",
            "employee_id": "EMP001",
            "designation": "CTO",
            "department": "Management",
            "skills": [
                ("Python", "language", "expert", 12, False, None),
                ("System Architecture", "domain", "expert", 10, False, None),
                ("Cloud Infrastructure", "platform", "expert", 8, False, None),
                ("Leadership", "domain", "expert", 8, False, None),
            ]
        },
        {
            "email": "cfo@skillshub.com",
            "name": "Maya Patel",
            "employee_id": "EMP002",
            "designation": "CFO",
            "department": "Management",
            "skills": [
                ("Financial Analysis", "domain", "expert", 15, False, None),
                ("Budget Planning", "domain", "expert", 14, False, None),
                ("Risk Management", "domain", "intermediate", 10, False, None),
                ("Excel", "tool", "expert", 12, False, None),
            ]
        },
        {
            "email": "delivery.head@skillshub.com",
            "name": "Rajan Mehta",
            "employee_id": "EMP003",
            "designation": "Delivery Head",
            "department": "Management",
            "skills": [
                ("Project Management", "domain", "expert", 11, False, None),
                ("Agile", "framework", "expert", 9, False, None),
                ("Stakeholder Management", "domain", "expert", 10, False, None),
                ("JIRA", "tool", "intermediate", 8, False, None),
            ]
        },
        {
            "email": "pm1@skillshub.com",
            "name": "Sara Johnson",
            "employee_id": "EMP004",
            "designation": "Project Manager",
            "department": "Management",
            "skills": [
                ("Agile", "framework", "expert", 7, False, None),
                ("Scrum", "framework", "expert", 7, False, None),
                ("JIRA", "tool", "intermediate", 6, False, None),
                ("Risk Management", "domain", "intermediate", 5, False, None),
            ]
        },
        {
            "email": "pm2@skillshub.com",
            "name": "Tom Williams",
            "employee_id": "EMP005",
            "designation": "Project Manager",
            "department": "Management",
            "skills": [
                ("Agile", "framework", "intermediate", 6, False, None),
                ("MS Project", "tool", "expert", 8, False, None),
                ("Stakeholder Management", "domain", "intermediate", 5, False, None),
                ("Scrum", "framework", "intermediate", 5, False, None),
            ]
        },
    ]

    # Development team (5 employees)
    development_employees = [
        {
            "email": "arch1@skillshub.com",
            "name": "Priya Nair",
            "employee_id": "EMP006",
            "designation": "Architect",
            "department": "Development",
            "skills": [
                ("Java", "language", "expert", 10, False, None),
                ("Spring Boot", "framework", "expert", 8, False, None),
                ("Microservices", "domain", "expert", 7, False, None),
                ("AWS", "platform", "intermediate", 6, False, None),
                ("System Design", "domain", "expert", 8, False, None),
            ]
        },
        {
            "email": "arch2@skillshub.com",
            "name": "Dev Kumar",
            "employee_id": "EMP007",
            "designation": "Architect",
            "department": "Development",
            "skills": [
                ("Python", "language", "expert", 9, False, None),
                ("Django", "framework", "expert", 7, False, None),
                ("PostgreSQL", "platform", "expert", 8, False, None),
                ("Docker", "tool", "intermediate", 5, False, None),
                ("Kubernetes", "platform", "novice", 2, False, None),
            ]
        },
        {
            "email": "dev1@skillshub.com",
            "name": "Arun Verma",
            "employee_id": "EMP008",
            "designation": "Developer",
            "department": "Development",
            "skills": [
                ("React", "framework", "expert", 5, False, None),
                ("TypeScript", "language", "intermediate", 4, False, None),
                ("Node.js", "framework", "intermediate", 4, False, None),
                ("CSS", "language", "intermediate", 5, False, None),
            ]
        },
        {
            "email": "dev2@skillshub.com",
            "name": "Lisa Park",
            "employee_id": "EMP009",
            "designation": "Developer",
            "department": "Development",
            "skills": [
                ("Python", "language", "intermediate", 3, False, None),
                ("FastAPI", "framework", "intermediate", 3, False, None),
                ("PostgreSQL", "platform", "novice", 2, False, None),
                ("Git", "tool", "intermediate", 3, False, None),
            ]
        },
        {
            "email": "dev3@skillshub.com",
            "name": "Carlos Diaz",
            "employee_id": "EMP010",
            "designation": "Developer",
            "department": "Development",
            "skills": [
                ("Java", "language", "intermediate", 4, False, None),
                ("Spring", "framework", "intermediate", 3, False, None),
                ("MySQL", "platform", "intermediate", 3, False, None),
                ("Docker", "tool", "novice", 1, False, None),
            ]
        },
    ]

    # QA team (2 employees)
    qa_employees = [
        {
            "email": "qa1@skillshub.com",
            "name": "Nina Sharma",
            "employee_id": "EMP011",
            "designation": "QA Analyst",
            "department": "Quality Assurance",
            "skills": [
                ("Selenium", "tool", "expert", 6, False, None),
                ("Python", "language", "intermediate", 4, False, None),
                ("Test Planning", "domain", "expert", 7, False, None),
                ("Postman", "tool", "intermediate", 4, False, None),
            ]
        },
        {
            "email": "qa2@skillshub.com",
            "name": "James Liu",
            "employee_id": "EMP012",
            "designation": "QA Analyst",
            "department": "Quality Assurance",
            "skills": [
                ("Manual Testing", "domain", "expert", 8, False, None),
                ("JIRA", "tool", "intermediate", 5, False, None),
                ("Test Cases", "domain", "expert", 8, False, None),
                ("Automation", "domain", "novice", 2, False, None),
            ]
        },
    ]

    # Design team (1 employee)
    design_employees = [
        {
            "email": "designer@skillshub.com",
            "name": "Aisha Rahman",
            "employee_id": "EMP013",
            "designation": "UI/UX Designer",
            "department": "Design",
            "skills": [
                ("Figma", "tool", "expert", 5, False, None),
                ("Adobe XD", "tool", "expert", 4, False, None),
                ("User Research", "domain", "intermediate", 4, False, None),
                ("Prototyping", "domain", "expert", 5, False, None),
                ("CSS", "language", "intermediate", 3, False, None),
            ]
        },
    ]

    # DevOps team (2 employees)
    devops_employees = [
        {
            "email": "devops1@skillshub.com",
            "name": "Kiran Joshi",
            "employee_id": "EMP014",
            "designation": "DevOps Engineer",
            "department": "DevOps",
            "skills": [
                ("Kubernetes", "platform", "expert", 6, False, None),
                ("Docker", "tool", "expert", 7, False, None),
                ("AWS", "platform", "expert", 8, False, None),
                ("Terraform", "tool", "intermediate", 5, False, None),
                ("CI/CD", "domain", "expert", 6, False, None),
            ]
        },
        {
            "email": "devops2@skillshub.com",
            "name": "Mike Torres",
            "employee_id": "EMP015",
            "designation": "DevOps Engineer",
            "department": "DevOps",
            "skills": [
                ("Jenkins", "tool", "expert", 8, False, None),
                ("Linux", "platform", "expert", 10, False, None),
                ("Ansible", "tool", "intermediate", 4, False, None),
                ("Docker", "tool", "intermediate", 5, False, None),
                ("Monitoring", "domain", "intermediate", 5, False, None),
            ]
        },
    ]

    all_employees = (
        management_employees + development_employees + qa_employees +
        design_employees + devops_employees
    )

    for emp_data in all_employees:
        email = emp_data["email"]
        if not db.query(User).filter(User.email == email).first():
            # Create user
            user = User(
                email=email,
                hashed_password=hash_password("password123"),
                name=emp_data["name"],
                role="employee",
                is_active=True,
            )
            db.add(user)
            db.flush()  # Ensure user ID is generated

            # Create employee record
            employee = Employee(
                user_id=user.id,
                employee_id=emp_data["employee_id"],
                name=emp_data["name"],
                dob=date(1990, 1, 1),
                date_of_joining=date(2023, 1, 1),
                designation=emp_data["designation"],
                department=emp_data["department"],
                location="Bangalore",
                work_mode="hybrid",
                seniority="mid" if emp_data["designation"] != "Architect" else "senior",
                profile_complete=False,
            )
            db.add(employee)
            db.flush()  # Ensure employee ID is generated

            # Create skills
            for skill_name, category, proficiency, years, is_inferred, confidence in emp_data["skills"]:
                skill = EmployeeSkill(
                    employee_id=employee.id,
                    skill_name=skill_name,
                    category=category,
                    proficiency=proficiency,
                    years=years,
                    is_inferred=is_inferred,
                    confidence_score=confidence,
                )
                db.add(skill)

            db.commit()

    db.close()
    print("All 16 users with skills seeded successfully!")


if __name__ == "__main__":
    seed_all()
