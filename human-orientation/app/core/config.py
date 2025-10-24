from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Settings:
    """Application settings with sane defaults and env overrides."""

    # Model/Inference
    model_weights: Optional[str] = os.getenv("MODEL_WEIGHTS", None)  # if None, ultralytics auto-downloads
    device: str = os.getenv("DEVICE", "cpu")  # "cpu" or "cuda:0"
    confidence_threshold: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.25"))
    iou_threshold: float = float(os.getenv("IOU_THRESHOLD", "0.45"))
    image_size: int = int(os.getenv("IMAGE_SIZE", "640"))

    # Domain specifics
    person_class_id: int = int(os.getenv("PERSON_CLASS_ID", "0"))


settings = Settings()
