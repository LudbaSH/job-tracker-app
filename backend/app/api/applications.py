# APIRouter defines routes in separate files instead of all in main.py
# This keeps the code organised — each file handles one group of endpoints
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Application

# Creates router instance - similar to a mini version of the FastAPI app
# All routes defined here get registered in main.py with the /api prefix
router = APIRouter()

# GET /api/applications — returns all applications in the database
# db: Session = Depends(get_db) automatically creates and closes a database
# session for this request — this is the get_db() function from db.py in action
@router.get("/application")
def get_applications(db: Session = Depends(get_db)):
    # Query the database for all rows in the applications table
    return db.query(Application).all()

# GET /api/applications/{id} — returns one specific application by its ID
# {id} is a path parameter — e.g. /api/applications/3 gets application with id=3
@router.get("/applications/{id}")
def get_application(id: int, db: Session = Depends(get_db)):
    # Filter the table to find the row where id matches
    app = db.query(Application).filter(Application.id == id).first()
    # If no application found with that ID, return a 404 error
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

# POST /api/applications — creates a new application
# The data parameter receives the JSON body sent from your React frontend
@router.post("/applications")
def create_applications(data: dict, db: Session = Depends(get_db)):
    # Create a new Application object using the data sent from the frontend
    new_app = Application(**data)
    # Stages the new app to the database and commits it (saves to database permanently)
    db.add(new_app)
    db.commit()
    # Refresh to get the auto-gen ID
    db.refresh(new_app)

    return new_app

# PUT /api/applications/{id} - updates an existing application
@router.put("/applications/{id}")
def update_application(id: int, data: dict, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    # Loop through the data sent and update each field on the object
    for key, value in data.items():
        setattr(app, key, value)
    db.commit()
    db.refresh(app)
    return app

# DELETE /api/applications/{id} - deletes an application by ID
@router.delete("/applications/{id}")
def delete_application(id: int, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(app)
    db.commit()
    # Return confirmation message 
    return {"message": "Application deleted", "id": id}