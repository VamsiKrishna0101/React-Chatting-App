from __future__ import annotations

from typing import List, Tuple

from pydantic import BaseModel, Field


class DetectionBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float = Field(ge=0, le=1)


class Keypoint(BaseModel):
    x: float
    y: float
    score: float = Field(ge=0, le=1)


class PoseDetectionSchema(BaseModel):
    box: DetectionBox
    keypoints: List[Keypoint]


class PredictResponse(BaseModel):
    num_persons: int
    detections: List[PoseDetectionSchema]
