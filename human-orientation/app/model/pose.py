from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Tuple

import numpy as np

from app.core.config import settings
from app.core.logger import get_logger


logger = get_logger(__name__)


@dataclass
class PoseDetection:
    """Single-person pose prediction details."""

    box_xyxy: Tuple[float, float, float, float]
    confidence: float
    keypoints: List[Tuple[float, float, float]]  # (x, y, score)


@dataclass
class PoseResult:
    """Pose predictions for one image."""

    detections: List[PoseDetection]
    image_shape: Tuple[int, int, int]  # (H, W, C)

    def num_persons(self) -> int:
        return len(self.detections)


class PoseEstimator:
    """Wrapper around Ultralytics YOLOv8 Pose for person keypoint detection."""

    def __init__(
        self,
        weights_path: Optional[str] = settings.model_weights,
        device: str = settings.device,
        confidence_threshold: float = settings.confidence_threshold,
        iou_threshold: float = settings.iou_threshold,
        image_size: int = settings.image_size,
    ) -> None:
        self.device = device
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self.image_size = image_size

        try:
            from ultralytics import YOLO  # type: ignore
        except Exception as exc:  # pragma: no cover - import error path
            logger.error("Ultralytics is not installed: %s", exc)
            raise

        # If weights_path is None, YOLO will auto-download default weights like 'yolov8n-pose.pt'
        model_source = weights_path or "yolov8n-pose.pt"
        logger.info(
            "Loading YOLOv8-Pose model: weights=%s device=%s", model_source, device
        )
        self.model = YOLO(model_source)

    def predict(self, image: np.ndarray) -> PoseResult:
        """Run pose inference on a single RGB or BGR image (H, W, C)."""
        if image is None or not isinstance(image, np.ndarray) or image.ndim != 3:
            raise ValueError("image must be a (H, W, C) numpy array")

        # Run inference
        results = self.model.predict(
            source=image,
            imgsz=self.image_size,
            conf=self.confidence_threshold,
            iou=self.iou_threshold,
            device=self.device,
            verbose=False,
        )

        if not results:
            return PoseResult(detections=[], image_shape=tuple(image.shape))

        result = results[0]

        detections: List[PoseDetection] = []

        # Boxes: xyxy and confidence
        try:
            boxes = result.boxes  # type: ignore[attr-defined]
            keypoints = result.keypoints  # type: ignore[attr-defined]
        except AttributeError:
            # In some versions, attributes may be missing if no detections
            return PoseResult(detections=[], image_shape=tuple(image.shape))

        if boxes is None or keypoints is None:
            return PoseResult(detections=[], image_shape=tuple(image.shape))

        # Convert tensors to CPU numpy
        # boxes.xyxy shape: (N, 4), boxes.conf shape: (N,)
        xyxy = getattr(boxes, "xyxy", None)
        conf = getattr(boxes, "conf", None)
        cls = getattr(boxes, "cls", None)

        if xyxy is None or conf is None:
            return PoseResult(detections=[], image_shape=tuple(image.shape))

        xyxy_np = xyxy.cpu().numpy() if hasattr(xyxy, "cpu") else np.asarray(xyxy)
        conf_np = conf.cpu().numpy() if hasattr(conf, "cpu") else np.asarray(conf)
        cls_np = cls.cpu().numpy() if hasattr(cls, "cpu") else (
            np.asarray(cls) if cls is not None else None
        )

        # keypoints.data shape: (N, K, 3)
        kpts_data = getattr(keypoints, "data", None)
        if kpts_data is None:
            return PoseResult(detections=[], image_shape=tuple(image.shape))
        kpts_np = (
            kpts_data.cpu().numpy() if hasattr(kpts_data, "cpu") else np.asarray(kpts_data)
        )

        num_dets = xyxy_np.shape[0]
        for i in range(num_dets):
            if cls_np is not None and int(cls_np[i]) != settings.person_class_id:
                # Pose model is person-only, but keep guard for completeness
                continue
            kp_list: List[Tuple[float, float, float]] = [
                (float(x), float(y), float(s)) for x, y, s in kpts_np[i]
            ]
            det = PoseDetection(
                box_xyxy=(
                    float(xyxy_np[i, 0]),
                    float(xyxy_np[i, 1]),
                    float(xyxy_np[i, 2]),
                    float(xyxy_np[i, 3]),
                ),
                confidence=float(conf_np[i]),
                keypoints=kp_list,
            )
            detections.append(det)

        return PoseResult(detections=detections, image_shape=tuple(image.shape))
