"""Utility script to create an admin user."""
import argparse

from sqlalchemy.exc import SQLAlchemyError

from app.auth.password import hash_password
from app.crud.admin_crud import AdminCRUD
from app.database import SessionLocal


def main() -> None:
    parser = argparse.ArgumentParser(description="Create admin user")
    parser.add_argument("--username", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    db = SessionLocal()
    try:
        existing = AdminCRUD.get_by_username(db, args.username)
        if existing:
            print(f"Admin '{args.username}' already exists")
            return

        AdminCRUD.create(db, args.username, hash_password(args.password))
        print(f"Admin '{args.username}' created successfully")
    except SQLAlchemyError as exc:
        print(f"Failed to create admin: {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
