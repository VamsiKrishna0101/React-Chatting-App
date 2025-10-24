from fastapi import APIRouter, File, UploadFile, HTTPException
from starlette.responses import JSONResponse
import numpy as np

from app.model.pose import PoseEstimator
from app.schemas.predict import PredictResponse, PoseDetectionSchema, DetectionBox, Keypoint
from app.utils.images import load_image_from_bytes, ensure_rgb
from app.services.classify import classify_orientation

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


_estimator: PoseEstimator | None = None


def _get_estimator() -> PoseEstimator:
    global _estimator
    if _estimator is None:
        _estimator = PoseEstimator()
    return _estimator


@router.post("/detect", response_model=PredictResponse)
async def detect(file: UploadFile = File(...)) -> JSONResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="file must be an image")
    image_bytes = await file.read()
    image_np = ensure_rgb(load_image_from_bytes(image_bytes))

    estimator = _get_estimator()
    result = estimator.predict(image_np)

    detections_schema: list[PoseDetectionSchema] = []
    for det in result.detections:
        box = DetectionBox(
            x1=det.box_xyxy[0],
            y1=det.box_xyxy[1],
            x2=det.box_xyxy[2],
            y2=det.box_xyxy[3],
            confidence=det.confidence,
        )
        kpts = [Keypoint(x=x, y=y, score=s) for x, y, s in det.keypoints]
        detections_schema.append(PoseDetectionSchema(box=box, keypoints=kpts))

    label = classify_orientation(result)

    payload = PredictResponse(
        num_persons=result.num_persons(),
        detections=detections_schema,
    )
    # Include label in top-level response via custom JSONResponse
    return JSONResponse(
        status_code=200,
        content={
            "label": label,
            **payload.dict(),
        },
    )
