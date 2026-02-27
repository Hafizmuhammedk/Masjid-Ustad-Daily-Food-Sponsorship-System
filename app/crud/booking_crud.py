"""CRUD operations for bookings."""
from datetime import date

from sqlalchemy import extract, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app import models, schemas


class BookingCRUD:
    """Booking CRUD methods."""

    @staticmethod
    def create(db: Session, payload: schemas.BookingCreate) -> models.Booking:
        booking = models.Booking(**payload.model_dump())
        try:
            db.add(booking)
            db.commit()
            db.refresh(booking)
        except IntegrityError as exc:
            db.rollback()
            raise exc
        except SQLAlchemyError as exc:
            db.rollback()
            raise exc
        return booking

    @staticmethod
    def get_by_date(db: Session, booking_date: date) -> models.Booking | None:
        stmt = select(models.Booking).where(models.Booking.booking_date == booking_date)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_monthly_schedule(
        db: Session, month: int, year: int
    ) -> list[schemas.BookingScheduleItem]:
        stmt = (
            select(models.Booking, models.Sponsor.full_name)
            .join(models.Sponsor, models.Sponsor.id == models.Booking.sponsor_id)
            .where(extract("month", models.Booking.booking_date) == month)
            .where(extract("year", models.Booking.booking_date) == year)
            .order_by(models.Booking.booking_date.asc())
        )
        rows = db.execute(stmt).all()
        return [
            schemas.BookingScheduleItem(
                booking_date=booking.booking_date,
                sponsor_name=full_name,
                food_note=booking.food_note,
                status=booking.status,
            )
            for booking, full_name in rows
        ]

    @staticmethod
    def delete(db: Session, booking_id: int) -> bool:
        booking = db.get(models.Booking, booking_id)
        if not booking:
            return False
        try:
            db.delete(booking)
            db.commit()
        except SQLAlchemyError as exc:
            db.rollback()
            raise exc
        return True
