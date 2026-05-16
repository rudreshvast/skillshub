from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "employee"


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool

    model_config = {"from_attributes": True}


class UserMeResponse(UserResponse):
    designation: str | None = None
    department: str | None = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    sub: str | None = None
