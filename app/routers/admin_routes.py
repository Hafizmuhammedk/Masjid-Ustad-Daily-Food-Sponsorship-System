"""Routes for admin authentication and protected actions."""
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import schemas
from app.auth.jwt_handler import create_access_token
from app.config import get_settings
from app.auth.password import verify_password
from app.crud.admin_crud import AdminCRUD
from app.crud.booking_crud import BookingCRUD
from app.dependencies import get_current_admin, get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin"])
settings = get_settings()


@router.post("/login", response_model=schemas.TokenResponse, status_code=status.HTTP_200_OK)
def login(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    """Authenticate admin and return JWT token."""

    admin = AdminCRUD.get_by_username(db, payload.username)
    if not admin or not verify_password(payload.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token, _ = create_access_token(subject=admin.username)
    return schemas.TokenResponse(
        access_token=token, expires_in_minutes=settings.access_token_expire_minutes
    )


@router.delete("/bookings/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Cancel/delete booking by ID (admin only)."""

    try:
        deleted = BookingCRUD.delete(db, booking_id)
    except SQLAlchemyError as exc:
        logger.exception("Failed to cancel booking", exc_info=exc)
        raise HTTPException(status_code=500, detail="Failed to cancel booking") from exc

    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    return {"message": "Booking cancelled successfully"}
