"""add_case_stages_and_timeline_types

Revision ID: ghi789012345
Revises: def456789012
Create Date: 2025-11-29 14:00:00.000000+00:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ghi789012345'
down_revision = 'def456789012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add stages column to cases table
    # Using JSON type for flexibility
    op.add_column('cases', sa.Column('stages', sa.JSON(), nullable=True))
    
    # Add type and stage_id to timeline_events
    # We need to create the enum type first for postgres
    timeline_event_type = sa.Enum('HEARING', 'REPORT', 'DECISION', 'PAYMENT', 'DOCUMENT', 'GENERIC', name='timelineeventtype')
    timeline_event_type.create(op.get_bind(), checkfirst=True)
    
    op.add_column('timeline_events', sa.Column('event_type', timeline_event_type, nullable=False, server_default='GENERIC'))
    op.add_column('timeline_events', sa.Column('stage_id', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('timeline_events', 'stage_id')
    op.drop_column('timeline_events', 'event_type')
    op.drop_column('cases', 'stages')
    
    # Drop the enum type
    timeline_event_type = sa.Enum(name='timelineeventtype')
    timeline_event_type.drop(op.get_bind(), checkfirst=True)
