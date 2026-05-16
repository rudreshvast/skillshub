"""extend_projects_with_metadata

Revision ID: 638043748b56
Revises: 175e0a39e887
Create Date: 2026-05-16 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '638043748b56'
down_revision: Union[str, Sequence[str], None] = '175e0a39e887'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('client', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('domain', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('tech_stack', sa.ARRAY(sa.String()), nullable=True))
    op.add_column('projects', sa.Column('links', sa.JSON(), nullable=True))
    op.add_column('projects', sa.Column('created_by', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_projects_created_by_users', 'projects', 'users', ['created_by'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_projects_created_by_users', 'projects', type_='foreignkey')
    op.drop_column('projects', 'created_by')
    op.drop_column('projects', 'links')
    op.drop_column('projects', 'tech_stack')
    op.drop_column('projects', 'domain')
    op.drop_column('projects', 'client')
