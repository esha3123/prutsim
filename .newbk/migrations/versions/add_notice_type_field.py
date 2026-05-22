"""Add notice_type field to notices table

Revision ID: add_notice_type_field
Revises: 77bb17ddb3c6
Create Date: 2025-04-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_notice_type_field'
down_revision = '77bb17ddb3c6'  # This should be the ID of your last migration
branch_labels = None
depends_on = None

def upgrade():
    # Add notice_type column with default value 'general'
    op.add_column('notices', sa.Column('notice_type', sa.String(50), nullable=False, server_default='general'))

def downgrade():
    # Remove the column if needed
    op.drop_column('notices', 'notice_type')