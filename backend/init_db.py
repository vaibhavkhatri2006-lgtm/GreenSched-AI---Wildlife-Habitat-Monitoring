from app.database import engine, Base
from app.models import *

print("Creating all tables in MySQL...")
try:
    Base.metadata.create_all(bind=engine)
    print("Success!")
except Exception as e:
    print("Error:", e)
