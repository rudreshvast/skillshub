from enum import Enum


class Department(str, Enum):
    MANAGEMENT = "Management"
    DEVELOPMENT = "Development"
    QUALITY_ASSURANCE = "Quality Assurance"
    DESIGN = "Design"
    DEVOPS = "DevOps"


class Designation(str, Enum):
    CTO = "CTO"
    CFO = "CFO"
    DELIVERY_HEAD = "Delivery Head"
    PROJECT_MANAGER = "Project Manager"
    ARCHITECT = "Architect"
    DEVELOPER = "Developer"
    QA_ANALYST = "QA Analyst"
    UI_UX_DESIGNER = "UI/UX Designer"
    DEVOPS_ENGINEER = "DevOps Engineer"


DEPARTMENT_DESIGNATIONS: dict[Department, list[Designation]] = {
    Department.MANAGEMENT: [
        Designation.CTO,
        Designation.CFO,
        Designation.DELIVERY_HEAD,
        Designation.PROJECT_MANAGER,
    ],
    Department.DEVELOPMENT: [
        Designation.ARCHITECT,
        Designation.DEVELOPER,
    ],
    Department.QUALITY_ASSURANCE: [
        Designation.QA_ANALYST,
    ],
    Department.DESIGN: [
        Designation.UI_UX_DESIGNER,
    ],
    Department.DEVOPS: [
        Designation.DEVOPS_ENGINEER,
    ],
}

DESIGNATION_DEPARTMENT: dict[Designation, Department] = {
    d: dept for dept, desigs in DEPARTMENT_DESIGNATIONS.items() for d in desigs
}

MANAGEMENT_DESIGNATIONS: list[Designation] = [
    Designation.CTO,
    Designation.CFO,
    Designation.DELIVERY_HEAD,
    Designation.PROJECT_MANAGER,
]

PROJECT_DESIGNATIONS: list[Designation] = [
    Designation.PROJECT_MANAGER,
    Designation.DELIVERY_HEAD,
    Designation.CTO,
    Designation.CFO,
]

RECOMMENDED_AUTHOR_DESIGNATIONS: list[Designation] = [
    Designation.CTO,
    Designation.ARCHITECT,
    Designation.DELIVERY_HEAD,
]
