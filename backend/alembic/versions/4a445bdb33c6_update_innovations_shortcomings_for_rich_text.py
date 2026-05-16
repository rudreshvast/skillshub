"""update_innovations_shortcomings_for_rich_text

Revision ID: 4a445bdb33c6
Revises: 03f640f96375
Create Date: 2026-05-16 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4a445bdb33c6'
down_revision: Union[str, Sequence[str], None] = '03f640f96375'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Rename description to content in project_innovations
    op.alter_column('project_innovations', 'description', new_column_name='content')

    # Add updated_at to project_innovations
    op.add_column('project_innovations', sa.Column('updated_at', sa.DateTime(), nullable=True))

    # Rename description to content in project_shortcomings
    op.alter_column('project_shortcomings', 'description', new_column_name='content')

    # Add updated_at to project_shortcomings
    op.add_column('project_shortcomings', sa.Column('updated_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove updated_at from project_shortcomings
    op.drop_column('project_shortcomings', 'updated_at')

    # Rename content back to description in project_shortcomings
    op.alter_column('project_shortcomings', 'content', new_column_name='description')

    # Remove updated_at from project_innovations
    op.drop_column('project_innovations', 'updated_at')

    # Rename content back to description in project_innovations
    op.alter_column('project_innovations', 'content', new_column_name='description')
