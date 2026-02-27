"""CRUD operations for sponsors."""
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import models, schemas


class SponsorCRUD:
    """Sponsor CRUD methods."""

    @staticmethod
    def create(db: Session, payload: schemas.SponsorCreate) -> models.Sponsor:
        sponsor = models.Sponsor(**payload.model_dump())
        try:
            db.add(sponsor)
            db.commit()
            db.refresh(sponsor)
        except SQLAlchemyError as exc:
            db.rollback()
            raise exc
        return sponsor

    @staticmethod
    def get_by_id(db: Session, sponsor_id: int) -> models.Sponsor | None:
        return db.get(models.Sponsor, sponsor_id)
