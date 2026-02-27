"""CRUD operations for admins."""
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import models


class AdminCRUD:
    """Admin CRUD methods."""

    @staticmethod
    def get_by_username(db: Session, username: str) -> models.Admin | None:
        stmt = select(models.Admin).where(models.Admin.username == username)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def create(db: Session, username: str, password_hash: str) -> models.Admin:
        admin = models.Admin(username=username, password_hash=password_hash)
        try:
            db.add(admin)
            db.commit()
            db.refresh(admin)
        except SQLAlchemyError as exc:
            db.rollback()
            raise exc
        return admin
