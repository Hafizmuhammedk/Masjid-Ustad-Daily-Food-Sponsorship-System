"""Routes for sponsor management."""
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import schemas
from app.crud.sponsor_crud import SponsorCRUD
from app.dependencies import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/sponsors", tags=["Sponsors"])


@router.post("", response_model=schemas.SponsorRead, status_code=status.HTTP_201_CREATED)
def create_sponsor(payload: schemas.SponsorCreate, db: Session = Depends(get_db)):
    """Register a sponsor."""

    try:
        return SponsorCRUD.create(db, payload)
    except SQLAlchemyError as exc:
        logger.exception("Failed to create sponsor", exc_info=exc)
        raise HTTPException(status_code=500, detail="Failed to create sponsor") from exc
