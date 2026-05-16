"""merge multiple heads

Revision ID: c0563618ecfa
Revises: 4a445bdb33c6, 8b6f2a1c4d9e
Create Date: 2026-05-16 20:10:14.413471

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c0563618ecfa'
down_revision: Union[str, Sequence[str], None] = ('4a445bdb33c6', '8b6f2a1c4d9e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
