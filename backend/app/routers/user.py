from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user_id, get_current_user
from app.models.user import User
from app.schemas.schemas import UserResponse, UserOnboardingRequest, UserPreferencesUpdate
from uuid import UUID

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get current user profile.
    """
    print(f"DEBUG: get_user_profile called for user_id: {user_id}")
    try:
        user = db.query(User).filter(User.id == UUID(user_id)).first()
        print(f"DEBUG: DB query result: {user}")
        if not user:
            print("DEBUG: User not found in DB")
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        print(f"DEBUG: Error in get_user_profile: {e}")
        raise e

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    profile_data: UserOnboardingRequest,
    user_data: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user profile with onboarding data. Creates user if not exists.
    """
    user_id = UUID(user_data["id"])
    email = user_data["email"]
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        # Create new user
        user = User(
            id=user_id,
            email=email
        )
        db.add(user)
    
    # Update fields
    user.name = profile_data.name
    user.age_group = profile_data.age_group
    user.gender = profile_data.gender
    user.occupation = profile_data.occupation
    user.wearable_connected = profile_data.wearable_connected
    
    db.commit()
    db.refresh(user)
    return user

@router.patch("/preferences", response_model=UserResponse)
async def update_user_preferences(
    preferences: UserPreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update user preferences (partial update).
    """
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update only provided fields
    update_data = preferences.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user
