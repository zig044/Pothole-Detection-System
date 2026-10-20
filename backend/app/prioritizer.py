from typing import Optional

WEIGHTS = {
    "severity": 0.30,   
    "size": 0.25,       
    "confidence": 0.20, 
    "location": 0.15,   
    "repeat": 0.10,      
}



SEVERITY_MAP = {
    "low": 30,
    "medium": 60,
    "high": 100,
}


THRESHOLDS = [
    (85, "Critical"),
    (70, "High"),
    (40, "Medium"),
    (0, "Low"),
]


ROAD_TYPE_SCORES = {
    "highway": 100,
    "main_road": 70,
    "residential": 40,
    "low_traffic": 20,
}



# 2. NORMALIZATION 

def _clamp(value: float, low: float = 0, high: float = 100) -> float:
    return max(low, min(high, value))


def normalize_severity(severity) -> float:
   
    if isinstance(severity, (int, float)):
        return _clamp(severity)
    key = str(severity).strip().lower()
    if key not in SEVERITY_MAP:
        raise ValueError(
            f"Unrecognized severity value: {severity!r}. "
            f"Expected one of {list(SEVERITY_MAP)} or a 0-100 number."
        )
    return SEVERITY_MAP[key]


def normalize_confidence(confidence) -> float:
    """YOLO confidence is 0-1 (e.g. 0.92). Converts it to a 0-100 scale."""
    if confidence is None:
        raise ValueError("confidence is required - it comes directly from YOLO.")
    return _clamp(confidence * 100)


def normalize_road_type(road_type: str) -> float:
    """Optional helper: converts a road-type label into a 0-100 score."""
    key = str(road_type).strip().lower()
    return ROAD_TYPE_SCORES.get(key, 40)  # default: residential-ish


def normalize_repeat_count(count: int, cap: int = 5) -> float:
   
    return _clamp((count / cap) * 100)



# 3. PRIORITY LEVEL LOOKUP

def categorize(score: float) -> str:
    for threshold, label in THRESHOLDS:
        if score >= threshold:
            return label
    return "Low"  # unreachable given THRESHOLDS ends at 0, kept for safety



# 4. MAIN FUNCTION

def calculate_priority(
    severity,
    confidence,
    size_score: Optional[float] = None,
    location_score: Optional[float] = None,
    repeat_score: Optional[float] = None,
) -> dict:
   
    # No detection = nothing to prioritize. Explicit, not silently scored.
    if confidence is None:
        return {
            "priority_score": None,
            "priority_level": "Not Applicable",
            "breakdown": {"reason": "No pothole detection - confidence missing."},
        }

    # Build up only the factors that are actually available
    available = {
        "severity": (normalize_severity(severity), WEIGHTS["severity"]),
        "confidence": (normalize_confidence(confidence), WEIGHTS["confidence"]),
    }
    if size_score is not None:
        available["size"] = (_clamp(size_score), WEIGHTS["size"])
    if location_score is not None:
        available["location"] = (_clamp(location_score), WEIGHTS["location"])
    if repeat_score is not None:
        available["repeat"] = (_clamp(repeat_score), WEIGHTS["repeat"])

   
    total_weight = sum(w for _, w in available.values())

    breakdown = {}
    weighted_sum = 0.0
    for factor_name, (value, weight) in available.items():
        effective_weight = weight / total_weight
        contribution = value * effective_weight
        weighted_sum += contribution
        breakdown[factor_name] = {
            "normalized_value": round(value, 1),
            "weight_used": round(effective_weight, 3),
            "contribution": round(contribution, 1),
        }

    priority_score = round(_clamp(weighted_sum), 1)
    priority_level = categorize(priority_score)

    return {
        "priority_score": priority_score,
        "priority_level": priority_level,
        "breakdown": breakdown,
    }