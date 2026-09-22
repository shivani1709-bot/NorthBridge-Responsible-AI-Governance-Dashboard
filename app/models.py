from typing import Literal

from pydantic import BaseModel, Field


ReviewCategory = Literal[
    "bug",
    "security",
    "performance",
    "maintainability",
    "testing",
]
ReviewSeverity = Literal["critical", "high", "medium", "low"]


class ReviewFinding(BaseModel):
    """A single actionable issue identified during code review."""

    category: ReviewCategory
    severity: ReviewSeverity
    file: str = Field(min_length=1)
    explanation: str = Field(min_length=1)
    suggested_fix: str = Field(min_length=1)

