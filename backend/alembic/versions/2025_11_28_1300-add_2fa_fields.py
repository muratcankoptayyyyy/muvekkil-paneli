"""add_2fa_fields

Revision ID: def456789012
Revises: abc123456789
Create Date: 2025-11-28 13:00:00.000000+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'def456789012'
down_revision = 'abc123456789'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('totp_secret', sa.String(), nullable=True))
    op.add_column('users', sa.Column('is_2fa_enabled', sa.Boolean(), nullable=True))
    # Set default value for existing rows if needed, but nullable=True handles it.
    # If we want default=False, we can do:
    op.execute("UPDATE users SET is_2fa_enabled = FALSE")
    # Then alter column to be not nullable if desired, but let's keep it nullable or default False in code.


def downgrade() -> None:
    op.drop_column('users', 'is_2fa_enabled')
    op.drop_column('users', 'totp_secret')
