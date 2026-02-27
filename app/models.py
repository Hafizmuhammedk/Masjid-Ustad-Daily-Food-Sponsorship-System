"""SQLAlchemy ORM models."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Sponsor(Base):
    """Sponsor entity."""

    __tablename__ = "sponsors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="sponsor", cascade="all, delete-orphan"
    )


class Booking(Base):
    """Booking entity."""

    __tablename__ = "bookings"
    __table_args__ = (Index("ix_bookings_booking_date", "booking_date"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    sponsor_id: Mapped[int] = mapped_column(
        ForeignKey("sponsors.id", ondelete="CASCADE"), nullable=False
    )
    booking_date: Mapped[date] = mapped_column(Date, nullable=False, unique=True)
    food_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="booked")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    sponsor: Mapped[Sponsor] = relationship(back_populates="bookings")


class Admin(Base):
    """Admin entity."""

    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
