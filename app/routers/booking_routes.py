"""Routes for booking management."""
import logging
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app import schemas
from app.crud.booking_crud import BookingCRUD
from app.crud.sponsor_crud import SponsorCRUD
from app.dependencies import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=schemas.BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db)):
    """Create a booking."""

    if payload.booking_date <= date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking date must be in the future",
        )

    sponsor = SponsorCRUD.get_by_id(db, payload.sponsor_id)
    if not sponsor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sponsor not found",
        )

    if BookingCRUD.get_by_date(db, payload.booking_date):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking date already reserved",
        )

    try:
        return BookingCRUD.create(db, payload)
    except IntegrityError as exc:
        logger.warning("Duplicate booking date attempted: %s", payload.booking_date)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking date already reserved",
        ) from exc
    except SQLAlchemyError as exc:
        logger.exception("Failed to create booking", exc_info=exc)
        raise HTTPException(status_code=500, detail="Failed to create booking") from exc


@router.get("", response_model=list[schemas.BookingScheduleItem], status_code=status.HTTP_200_OK)
def get_monthly_schedule(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=1900, le=2100),
    db: Session = Depends(get_db),
):
    """Get monthly booking schedule."""

    return BookingCRUD.get_monthly_schedule(db, month, year)
