"""JWT generation and decoding utilities."""
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()


def create_access_token(subject: str) -> tuple[str, datetime]:
    """Create JWT token and return token with expiry datetime."""

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    to_encode = {"sub": subject, "exp": expire}
    token = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return token, expire


def decode_access_token(token: str) -> str | None:
    """Decode access token and return subject username."""

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except JWTError:
        return None
