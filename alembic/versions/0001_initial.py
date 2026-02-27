"""initial

Revision ID: 0001_initial
Revises: 
Create Date: 2026-01-01 00:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index(op.f("ix_admins_id"), "admins", ["id"], unique=False)

    op.create_table(
        "sponsors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=150), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("email", sa.String(length=150), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sponsors_id"), "sponsors", ["id"], unique=False)
    op.create_index(op.f("ix_sponsors_phone"), "sponsors", ["phone"], unique=False)

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sponsor_id", sa.Integer(), nullable=False),
        sa.Column("booking_date", sa.Date(), nullable=False),
        sa.Column("food_note", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["sponsor_id"], ["sponsors.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("booking_date"),
    )
    op.create_index(op.f("ix_bookings_id"), "bookings", ["id"], unique=False)
    op.create_index("ix_bookings_booking_date", "bookings", ["booking_date"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_bookings_booking_date", table_name="bookings")
    op.drop_index(op.f("ix_bookings_id"), table_name="bookings")
    op.drop_table("bookings")
    op.drop_index(op.f("ix_sponsors_phone"), table_name="sponsors")
    op.drop_index(op.f("ix_sponsors_id"), table_name="sponsors")
    op.drop_table("sponsors")
    op.drop_index(op.f("ix_admins_id"), table_name="admins")
    op.drop_table("admins")
