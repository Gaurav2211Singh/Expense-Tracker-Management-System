# ORM - Object Relational Mapping
# SQLAlchemy is a library that provides a full suite of well known enterprise-level persistence patterns, designed for efficient and high-performing database access, adapted into a Pythonic domain language.
# It is a library that allows us to interact with the database using Python objects instead of SQL queries.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://neondb_owner:npg_OXw8ViuQclx6@ep-jolly-dream-a1goa8uv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
