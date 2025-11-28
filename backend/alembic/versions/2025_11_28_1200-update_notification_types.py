"""update notification types

Revision ID: abc123456789
Revises: 61e19948c900
Create Date: 2025-11-28 12:00:00.000000+00:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abc123456789'
down_revision = '61e19948c900'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # PostgreSQL specific command to add values to enum
    # We need to execute this in a transaction block usually, but ALTER TYPE cannot run inside a transaction block 
    # in some older Postgres versions. However, in newer ones it can.
    # But Alembic runs in a transaction by default.
    # To be safe, we can use op.execute with commit if needed, but usually just op.execute works for newer PG.
    
    # Note: 'ALTER TYPE ... ADD VALUE' cannot be rolled back in a transaction.
    
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'CASE_UPDATE'")
        op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'DOCUMENT_UPLOAD'")
        op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'PAYMENT_UPDATE'")
        op.execute("ALTER TYPE notificationtype ADD VALUE IF NOT EXISTS 'SYSTEM'")


def downgrade() -> None:
    # Removing values from ENUM is not directly supported in PostgreSQL without dropping and recreating the type.
    # For now, we will leave it as is, or we could implement a complex downgrade if strictly necessary.
    pass
