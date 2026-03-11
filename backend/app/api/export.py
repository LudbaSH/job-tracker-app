from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Application
import pandas as pd
import io # Input/Output module

router = APIRouter()

# Get /api/export/csv - exports all applications as a downloadable CSV file
@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    apps = db.query(Application).all()

    # Convert the list of Application objects into a list of dictionaries so pandas can read it
    data = []
    for app in apps:
        data.append({
            "Company": app.company,
            "Role": app.role,
            "Status": app.status,
            "Location": app.location,
            "Salary Range": app.salary_range,
            "Date Applied": app.date_applied,
            "Last Updated": app.last_updated,
            "Source": app.source,
            "Notes": app.notes,
            "Job URL": app.job_url,
        })
    
    # Create a pandas DataFrame - a table structure pandas can work with
    df = pd.DataFrame(data)

    # Write the DF to a CSV in memory (RAM) instead of saving to disk
    # io.StringIO() creates an in-memory text buffer - temp file
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    # StreamingResponse sends the CSV as a downloadable file to the browser
    # media_type tells the browser is CSV
    # Content-Disposition tells the browser to download it with this filename
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications.csv"}
    )