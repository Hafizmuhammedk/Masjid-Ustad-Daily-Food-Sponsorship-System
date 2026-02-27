"""Common dependencies for routes."""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.auth.jwt_handler import decode_access_token
from app.crud.admin_crud import AdminCRUD

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")


def get_db():
    """Yield database session."""

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_admin(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """Validate JWT token and return current admin model."""

    username = decode_access_token(token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    admin = AdminCRUD.get_by_username(db, username=username)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return admin
