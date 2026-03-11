# SQLAlchemy allows python to communicate with the database
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base # Defines database tables as Python classes
from datetime import datetime, timezone # Set the date/time for when a new application is added

# Foundation class that all database models will inherit from
# Keeps track of all tables in the database
Base = declarative_base()

# Represents the applications table in the database
# Every instance of this class = one row in the table (one job application)
class Application(Base):
    
    # Tells SQLAlchemy the actual name of the table in the database
    __tablename__ = 'applications'

    # Each row gets a unique ID automatically - the primary key
    # index = True makes searching by ID faster
    id = Column(Integer, primary_key=True, index=True)
    # nullable = False makes the field required - can't add an application without company name
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    # Optional field - no status defaults to "Applied"
    status = Column(String, default='Applied')

    # Remaining fields are optional (not required to be filled, no default)
    location = Column(String)
    salary_range = Column(String) # stored as text since formats vary (later versions can have a proper formatting for this field)
    job_url = Column(String)

    # Automatically sets the current date/time when the row is created
    date_applied = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    notes = Column(String) # Field to input any notes about the role
    source = Column(String) # Field to input source of job e.g. 'LinkedIn', 'Referral', etc.