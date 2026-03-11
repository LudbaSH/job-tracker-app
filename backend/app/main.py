# FastAPI framework runs the backend server
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # CORS (Cross-Origin Resource Sharing)
from app.database.db import engine # Imports database engine from db.py - this connects Python to SQLite database file
from app.database.models import Base # Imports Base class with all table data
from app.api import applications, analytics, export # Imports route files from api folder

# Looks at all the classes that inherit from Base and creates actual tables in the database if they don't exist yet
# This is the reason why database.db gets created automatically when FastAPI starts
Base.metadata.create_all(bind=engine)

# Creates FastAPI instance - everything connects to this object
# Title= is what shows up on the auto-gen docs page at /docs
app = FastAPI(title='Job Tracker API')

# Adds CORS middleware to the app
app.add_middleware(
    CORSMiddleware,
    # Only allow requests coming from React app's address
    allow_origins = ["http://localhost:5173"],
    # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_methods = ['*'],
    # Allow all headers to be sent with requests
    allow_headers = ['*']
)

# Registers routes with app
# prefix "/api" means all routes in applications.py will start with /api
# e.g. a route defined as "/applications" becomes "/api/applications"
app.include_router(applications.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(export.router, prefix="/api")

'''
**CORS explained simply:**

Browsers have a built in security rule — a webpage can only request data from the **same origin** (same domain + port) it was loaded from. This is called the Same Origin Policy.

In your project you have two different origins:
```
React frontend  → http://localhost:5173
FastAPI backend → http://localhost:8000
```

Even though both are on your own computer, the browser sees them as different origins because the port numbers are different. 
So when React tries to fetch data from FastAPI, the browser blocks it by default thinking it could be a malicious cross-site request.

CORS middleware tells the browser:

> "It's okay, I the server am explicitly allowing requests from `http://localhost:5173`"

The browser sees that permission and allows the request through.

**Without CORS you'd see this error in your browser console:**
```
Access to fetch at 'http://localhost:8000' from origin 
'http://localhost:5173' has been blocked by CORS policy
'''