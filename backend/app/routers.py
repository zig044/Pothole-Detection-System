import os
import shutil
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile
)
from sqlalchemy.orm import Session

from .database import SessionLocal
from .models import PotholeReport
from .schemas import PotholeReportResponse
from .detector import detect_pothole
from .prioritizer import (
    calculate_priority,
    normalize_road_type,
    normalize_repeat_count
)


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

UPLOAD_FOLDER = "uploads"

ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/jpg"
]


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post(
    "/",
    response_model=PotholeReportResponse
)
def create_report(
    image: UploadFile = File(...),
    description: str = Form(...),
    severity: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    road_type: str = Form("residential"),
    db: Session = Depends(get_db)
):

    # Check image type
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPG and PNG images are allowed"
        )

    # Create uploads folder
    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True
    )

    # Create unique filename
    file_extension = os.path.splitext(
        image.filename
    )[1]

    unique_filename = (
        f"{uuid.uuid4()}{file_extension}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    # Save image
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            image.file,
            buffer
        )

    # Run YOLO detection
    detection = detect_pothole(file_path)

    # ------------------------------------------------
    # COUNT NEARBY PREVIOUS REPORTS
    # ------------------------------------------------

    nearby_reports = db.query(
        PotholeReport
    ).filter(
        PotholeReport.latitude.isnot(None),
        PotholeReport.longitude.isnot(None)
    ).all()

    repeat_count = 0

    # Approximately 50-60 metres
    # 0.0005 degrees is used as a simple
    # geographic proximity threshold.
    DISTANCE_THRESHOLD = 0.0005

    for report in nearby_reports:

        latitude_difference = abs(
            report.latitude - latitude
        )

        longitude_difference = abs(
            report.longitude - longitude
        )

        if (
            latitude_difference <= DISTANCE_THRESHOLD
            and
            longitude_difference <= DISTANCE_THRESHOLD
        ):
            repeat_count += 1

    # Convert repeat count into score
    repeat_score = normalize_repeat_count(
        repeat_count
    )

    # ------------------------------------------------
    # NO POTHOLE DETECTED
    # ------------------------------------------------

    if detection is None:

        confidence = 0.0
        priority_score = None
        priority_level = "Not Applicable"

    # ------------------------------------------------
    # POTHOLE DETECTED
    # ------------------------------------------------

    else:

        confidence = detection["confidence"]

        # Image dimensions
        image_width = detection["image_width"]
        image_height = detection["image_height"]

        # Pothole dimensions
        pothole_width = detection["width"]
        pothole_height = detection["height"]

        # Pothole area
        pothole_area = (
            pothole_width * pothole_height
        )

        # Image area
        image_area = (
            image_width * image_height
        )

        # Area ratio
        if image_area > 0:
            area_ratio = (
                pothole_area / image_area
            )
        else:
            area_ratio = 0

        # Size score
        size_score = min(
            (area_ratio / 0.10) * 100,
            100
        )

        # Road type score
        location_score = normalize_road_type(
            road_type
        )

        # Final priority calculation
        priority_result = calculate_priority(
            severity=severity,
            confidence=confidence,
            size_score=size_score,
            location_score=location_score,
            repeat_score=repeat_score
        )

        priority_score = (
            priority_result["priority_score"]
        )

        priority_level = (
            priority_result["priority_level"]
        )

    # ------------------------------------------------
    # SAVE REPORT
    # ------------------------------------------------

    new_report = PotholeReport(
        image_path=file_path,
        description=description,
        severity=severity,
        latitude=latitude,
        longitude=longitude,
        road_type=road_type,
        confidence=confidence,
        priority_score=priority_score,
        priority_level=priority_level,
        status="pending"
    )

    db.add(new_report)

    db.commit()

    db.refresh(new_report)

    return new_report


@router.get(
    "/",
    response_model=list[PotholeReportResponse]
)
def get_reports(
    db: Session = Depends(get_db)
):

    reports = db.query(
        PotholeReport
    ).all()

    return reports


@router.get(
    "/{report_id}",
    response_model=PotholeReportResponse
)
def get_report(
    report_id: int,
    db: Session = Depends(get_db)
):

    report = db.query(
        PotholeReport
    ).filter(
        PotholeReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    return report


@router.put(
    "/{report_id}/status",
    response_model=PotholeReportResponse
)
def update_report_status(
    report_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    report = db.query(
        PotholeReport
    ).filter(
        PotholeReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    report.status = status

    db.commit()

    db.refresh(report)

    return report


@router.delete(
    "/{report_id}"
)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db)
):

    report = db.query(
        PotholeReport
    ).filter(
        PotholeReport.id == report_id
    ).first()

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found"
        )

    db.delete(report)

    db.commit()

    return {
        "message": "Report deleted successfully"
    }