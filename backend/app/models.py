from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class PotholeReport(Base):
    __tablename__ = "pothole_reports"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    image_path: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    severity: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="medium"
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    road_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="residential"
    )

    confidence: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    priority_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    priority_level: Mapped[str | None] = mapped_column(
        String,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="pending"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )