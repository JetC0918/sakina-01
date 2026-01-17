from datetime import datetime, timedelta
from typing import Any, Tuple, Dict, Optional

# Simple in-memory cache: Dict[key, Tuple[value, expiry_time]]
_cache: Dict[str, Tuple[Any, datetime]] = {}

def get_cached(key: str) -> Optional[Any]:
    """
    Get a value from cache if it exists and hasn't expired.
    """
    if key in _cache:
        value, expiry = _cache[key]
        if datetime.utcnow() < expiry:
            return value
        else:
            # Clean up expired item
            del _cache[key]
    return None

def set_cached(key: str, value: Any, ttl_seconds: int = 60) -> None:
    """
    Set a value in the cache with a specified TTL (in seconds).
    """
    expiry = datetime.utcnow() + timedelta(seconds=ttl_seconds)
    _cache[key] = (value, expiry)

def clear_cache(key_prefix: str = None) -> None:
    """
    Clear cache items. If key_prefix is provided, only clear keys starting with it.
    """
    if key_prefix:
        keys_to_remove = [k for k in _cache.keys() if k.startswith(key_prefix)]
        for k in keys_to_remove:
            del _cache[k]
    else:
        _cache.clear()
