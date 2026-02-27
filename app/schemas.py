"""Pydantic schemas for API I/O."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SponsorBase(BaseModel):
    """Shared sponsor payload fields."""

    full_name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=1, max_length=20)
    email: EmailStr | None = None


class SponsorCreate(SponsorBase):
    """Schema for creating sponsor."""


class SponsorRead(SponsorBase):
    """Schema for returning sponsor."""

    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingCreate(BaseModel):
    """Schema for creating booking."""

    sponsor_id: int = Field(gt=0)
    booking_date: date
    food_note: str | None = None


class BookingRead(BaseModel):
    """Schema for returning booking."""

    id: int
    sponsor_id: int
    booking_date: date
    food_note: str | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookingScheduleItem(BaseModel):
    """Schema for monthly schedule entry."""

    booking_date: date
    sponsor_name: str
    food_note: str | None
    status: str


class AdminLogin(BaseModel):
    """Admin login request."""

    username: str
    password: str


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
