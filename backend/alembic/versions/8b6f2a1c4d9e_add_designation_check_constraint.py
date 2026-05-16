"""add_designation_check_constraint

Revision ID: 8b6f2a1c4d9e
Revises: 175e0a39e887
Create Date: 2026-05-16 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8b6f2a1c4d9e'
down_revision: Union[str, Sequence[str], None] = '175e0a39e887'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_check_constraint(
        'ck_employees_designation',
        'employees',
        "designation IN ('CTO','CFO','Delivery Head','Project Manager','Architect','Developer','QA Analyst','UI/UX Designer','DevOps Engineer','Engineer','Director','Software Engineer','Frontend Developer','Engineering Manager','Software Delivery expert','Data Engineer','QA Engineer','Product Manager','Tech Lead','Principal')"
    )


def downgrade() -> None:
    op.drop_constraint('ck_employees_designation', 'employees', type_='check')
