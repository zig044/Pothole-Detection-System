from pydantic import BaseModel
from datetime import datetime


class PotholeReportResponse(BaseModel):
    id: int
    image_path: str
    description: str | None
    severity: str
    latitude: float | None
    longitude: float | None
    road_type: str
    confidence: float
    priority_score: float | None
    priority_level: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True