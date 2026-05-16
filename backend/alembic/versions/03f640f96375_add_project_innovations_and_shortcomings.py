"""add_project_innovations_and_shortcomings

Revision ID: 03f640f96375
Revises: 638043748b56
Create Date: 2026-05-16 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '03f640f96375'
down_revision: Union[str, Sequence[str], None] = '638043748b56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'project_innovations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_innovations_id'), 'project_innovations', ['id'], unique=False)

    op.create_table(
        'project_shortcomings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('linked_skill', sa.String(), nullable=True),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_shortcomings_id'), 'project_shortcomings', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_project_shortcomings_id'), table_name='project_shortcomings')
    op.drop_table('project_shortcomings')
    op.drop_index(op.f('ix_project_innovations_id'), table_name='project_innovations')
    op.drop_table('project_innovations')
