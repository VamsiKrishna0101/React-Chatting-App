from __future__ import annotations

from typing import Literal

import numpy as np

from app.model.pose import PoseDetection, PoseResult

OrientationLabel = Literal["Front", "Left", "Right", "Full Body", "N/A"]


def classify_orientation(result: PoseResult) -> OrientationLabel:
    """Heuristic classification for orientation.

    Rules (initial/simple placeholder):
    - 0 persons -> "N/A"
    - >1 persons -> "N/A"
    - 1 person:
        - If bbox is tall (height>1.5*width) and many keypoints visible -> "Full Body"
        - Otherwise use left-vs-right based on relative position of left/right keypoints
          (e.g. left shoulder vs right shoulder x-coordinates). If shoulders are symmetric -> "Front".
    """
    if result.num_persons() == 0:
        return "N/A"
    if result.num_persons() > 1:
        return "N/A"

    det: PoseDetection = result.detections[0]
    x1, y1, x2, y2 = det.box_xyxy
    width = max(1e-6, x2 - x1)
    height = max(1e-6, y2 - y1)
    aspect = height / width

    keypoints = det.keypoints
    # YOLOv8 Pose keypoints order (COCO): 0-nose, 5-left_shoulder, 6-right_shoulder
    # Use indices with guard checks
    kp_arr = np.array(keypoints, dtype=float)  # shape (K,3)

    # visibility threshold
    visible_mask = kp_arr[:, 2] > 0.2
    visible_count = int(np.sum(visible_mask))

    if aspect > 1.5 and visible_count >= 10:
        return "Full Body"

    # Shoulders indices (defensive)
    left_shoulder_idx, right_shoulder_idx = 5, 6
    if (
        left_shoulder_idx < kp_arr.shape[0]
        and right_shoulder_idx < kp_arr.shape[0]
        and kp_arr[left_shoulder_idx, 2] > 0.2
        and kp_arr[right_shoulder_idx, 2] > 0.2
    ):
        left_x = kp_arr[left_shoulder_idx, 0]
        right_x = kp_arr[right_shoulder_idx, 0]
        mid_x = (x1 + x2) / 2.0
        # normalize by bbox width
        delta = (left_x - right_x) / width
        centered_left = (left_x - mid_x) / width
        centered_right = (right_x - mid_x) / width

        if abs(delta) < 0.05 and abs(centered_left) < 0.2 and abs(centered_right) < 0.2:
            return "Front"
        return "Left" if delta > 0 else "Right"

    # Fallback using nose x-position relative to bbox
    nose_idx = 0
    if nose_idx < kp_arr.shape[0] and kp_arr[nose_idx, 2] > 0.2:
        nose_x = kp_arr[nose_idx, 0]
        rel = (nose_x - x1) / width
        if 0.4 <= rel <= 0.6:
            return "Front"
        return "Left" if rel < 0.5 else "Right"

    return "N/A"
