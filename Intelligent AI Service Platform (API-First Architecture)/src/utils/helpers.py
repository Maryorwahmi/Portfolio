"""
Utility helper functions
Crafted by CaptainCode
"""
import hashlib
from typing import List, Dict, Any
from datetime import datetime, timedelta


def hash_string(s: str) -> str:
    """Hash a string using SHA-256"""
    return hashlib.sha256(s.encode()).hexdigest()


def generate_session_hash() -> str:
    """Generate a unique session hash"""
    import uuid
    return str(uuid.uuid4())


def format_timestamp(dt: datetime) -> str:
    """Format datetime to ISO string"""
    return dt.isoformat() + "Z"


def truncate_text(text: str, max_length: int = 100) -> str:
    """Truncate text with ellipsis"""
    if len(text) > max_length:
        return text[:max_length] + "..."
    return text


def calculate_time_ago(dt: datetime) -> str:
    """Calculate human-readable time ago string"""
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 365:
        return f"{diff.days // 365} years ago"
    elif diff.days > 30:
        return f"{diff.days // 30} months ago"
    elif diff.days > 0:
        return f"{diff.days} days ago"
    elif diff.seconds > 3600:
        return f"{diff.seconds // 3600} hours ago"
    elif diff.seconds > 60:
        return f"{diff.seconds // 60} minutes ago"
    else:
        return "just now"


def chunk_text(text: str, chunk_size: int = 500) -> List[str]:
    """Split text into chunks"""
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]


def extract_keywords(text: str, num_keywords: int = 5) -> List[str]:
    """
    Extract important keywords from text
    (Simple implementation - can be enhanced with NLP)
    """
    import re
    
    # Remove common stop words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have',
        'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
        'i', 'you', 'he', 'she', 'it', 'we', 'they'
    }
    
    # Extract words
    words = re.findall(r'\b\w+\b', text.lower())
    
    # Filter stop words
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    
    # Return top unique keywords
    return list(set(keywords))[:num_keywords]


def validate_email(email: str) -> bool:
    """Validate email address format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def merge_dicts(*dicts: Dict) -> Dict:
    """Merge multiple dictionaries"""
    result = {}
    for d in dicts:
        result.update(d)
    return result


def get_pagination_params(skip: int = 0, limit: int = 10) -> tuple:
    """Validate and return pagination parameters"""
    skip = max(0, skip)
    limit = min(max(1, limit), 100)  # Max 100 items per page
    return skip, limit


def calculate_confidence_score(*scores: float) -> float:
    """Calculate average confidence from multiple scores"""
    if not scores:
        return 0.0
    return sum(scores) / len(scores)
