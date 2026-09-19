from app.database import SessionLocal
from app.models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user():
    db = SessionLocal()
    hashed = pwd_context.hash("password")
    new_user = User(name="Test User", email="test@test.com", password_hash=hashed, role="Admin")
    db.add(new_user)
    try:
        db.commit()
        print("Test user created: test@test.com / password")
    except Exception as e:
        print("Error or user exists:", e)
    finally:
        db.close()

create_user()
