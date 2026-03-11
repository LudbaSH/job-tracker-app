from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.database.models import Application

router = APIRouter()

# GET /api/analytics - returns a summary of the statistics of the user's applications
@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    # Get every application from the database
    apps = db.query(Application).all()

    # Count total number of applications
    total = len(apps)

    # Count the number of applications in each status by going through every application and grouping them
    status_counts = {}
    for app in apps:
        status = app.status
        if status not in status_counts:
            status_counts[status] = 0
        status_counts[status] += 1

    # Calculate interview rate - % of applications that got an interview
    interviews = status_counts.get("Interview", 0)
    interview_rate = round(interviews / (total * 100), 1) if total > 0 else 0

    # Calculate offer rate - % of applications that got an offer
    offers = status_counts.get("Offer", 0)
    offer_rate = round(offers / (total  * 100), 1) if total > 0 else 0

    # Return everything as a dictionary - FastAPI converts this to JSON
    return {
        'total': total,
        'status_counts': status_counts,
        'interview_rate': interview_rate,
        'offer_rate': offer_rate
    }