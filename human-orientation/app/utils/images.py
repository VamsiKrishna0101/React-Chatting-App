from __future__ import annotations

from io import BytesIO
from typing import Tuple

import cv2
import numpy as np
from PIL import Image


def load_image_from_bytes(image_bytes: bytes) -> np.ndarray:
    """Load an image from raw bytes into a numpy array in RGB format.

    Returns an array with shape (H, W, 3) and dtype=uint8.
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


def ensure_rgb(image: np.ndarray) -> np.ndarray:
    """Ensure the numpy image is in RGB format."""
    if image.ndim != 3:
        raise ValueError("image must be (H, W, C)")
    if image.shape[2] == 3:
        return image
    if image.shape[2] == 4:
        # RGBA -> RGB
        return cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
    raise ValueError("Unsupported channel count: %s" % (image.shape[2],))


def draw_boxes(image: np.ndarray, boxes: np.ndarray, color=(0, 255, 0), thickness: int = 2) -> np.ndarray:
    """Draw bounding boxes on an RGB image and return the result."""
    img_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    for x1, y1, x2, y2 in boxes.astype(int):
        cv2.rectangle(img_bgr, (x1, y1), (x2, y2), color, thickness)
    return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)


def encode_image_to_jpeg(image: np.ndarray, quality: int = 90) -> bytes:
    """Encode an RGB image to JPEG bytes."""
    img_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    success, buf = cv2.imencode(".jpg", img_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not success:
        raise RuntimeError("Failed to encode JPEG")
    return buf.tobytes()
