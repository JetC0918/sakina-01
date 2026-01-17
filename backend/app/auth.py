"""
Supabase JWT authentication middleware.
Verifies tokens from Supabase Auth and extracts user information.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from app.config import settings

# Bearer token security scheme
security = HTTPBearer()


async def verify_supabase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify Supabase JWT and return user info.
    
    Args:
        credentials: Bearer token from Authorization header
        
    Returns:
        User data from Supabase Auth
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.SUPABASE_ANON_KEY
                }
            )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Supabase auth unavailable: {exc}"
        ) from exc
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return response.json()


async def get_current_user_id(
    user: dict = Depends(verify_supabase_token)
) -> str:
    """
    Extract user ID from verified Supabase token.
    
    Args:
        user: Verified user data from Supabase
        
    Returns:
        User UUID as string
    """
    return user["id"]


async def get_current_user(
    user: dict = Depends(verify_supabase_token)
) -> dict:
    """
    Get full user data from verified Supabase token.
    
    Args:
        user: Verified user data from Supabase
        
    Returns:
        Complete user object with id, email, etc.
    """
    return user
