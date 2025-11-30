"""Add must_change_password field to users

Revision ID: 2025_11_30_1600
Revises: 1234567890ab
Create Date: 2025-11-30 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2025_11_30_1600'
down_revision = '1234567890ab'
branch_labels = None
depends_on = None


def upgrade():
    # Add must_change_password column to users table
    op.add_column('users', sa.Column('must_change_password', sa.Boolean(), nullable=True, server_default='false'))


def downgrade():
    # Remove must_change_password column from users table
    op.drop_column('users', 'must_change_password')
