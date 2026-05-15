from app.db.database import SessionLocal
from app.models.user import User
from app.auth.utils import hash_password


def seed_users():
    db = SessionLocal()

    # Check if users already exist
    hr_user = db.query(User).filter(User.email == "hr@skillshub.com").first()
    employee_user = db.query(User).filter(User.email == "employee@skillshub.com").first()

    if not hr_user:
        hr_user = User(
            email="hr@skillshub.com",
            hashed_password=hash_password("password123"),
            name="HR Admin",
            role="hr",
            is_active=True,
        )
        db.add(hr_user)

    if not employee_user:
        employee_user = User(
            email="employee@skillshub.com",
            hashed_password=hash_password("password123"),
            name="Employee User",
            role="employee",
            is_active=True,
        )
        db.add(employee_user)

    db.commit()
    db.close()
    print("Test users seeded successfully!")


if __name__ == "__main__":
    seed_users()
