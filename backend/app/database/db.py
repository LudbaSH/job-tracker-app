# SQLAlchemy needs three things to connect to the database:
# 1. Where the database file is (the URL)
# 2. An engine (the actual connection)
# 3. A session (what is used to run queries)
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

'''
DATABASE_URL  →  tells SQLAlchemy WHERE the database is
engine        →  the actual CONNECTION to the database
SessionLocal  →  the WORKSPACE you use to read/write data
get_db()      →  gives each API request its own fresh workspace
and cleans it up automatically when done
'''

# Path to SQLite database file
# sqlite:/// means to use SQLite and look for the file at this path
# ./database.db creates the file in the backend folder, if it doesnt exist then SQLite creates it
DATABASE_URL = "sqlite:///./database.db"

# The engine is the core connection to the database
# By default SQLite only allows one thread to use it at a time
# FastAPI uses multiple threads - connect_args={"check_same_thread": False} disables that restriction
engine = create_engine(
    DATABASE_URL,
    connect_args={'check_same_thread': False}
)

# Temporary workspace for database operations
# autocommit=False means changes aren't saved until explicitly said so
# autoflush=False means SQLAlchemy won't automatically send pending changes
# bind=engine connects the session to your database engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# This is a dependency function that FastAPI uses to manage sessions
# It creates a new session for each incoming request and closes it when the request is done - even if an error occurs
# The "yield" makes it a generator - FastAPI handles the lifecycle automatically
# This function will be used in the api/ route files
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close