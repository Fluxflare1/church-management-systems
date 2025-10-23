import jwt
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    
    # Add custom claims
    refresh['user_type'] = user.user_type
    refresh['branch_id'] = user.branch.id if user.branch else None
    refresh['is_verified'] = user.is_verified
    
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

def generate_jwt_token(user, token_type='access', expires_in=3600):
    """
    Generate a custom JWT token for specific purposes
    """
    payload = {
        'user_id': user.id,
        'email': user.email,
        'token_type': token_type,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in),
        'iat': datetime.utcnow(),
    }
    
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token

def verify_jwt_token(token, token_type='access'):
    """
    Verify a custom JWT token
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('token_type') != token_type:
            return None
            
        return payload
        
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def get_user_from_token(token):
    """
    Extract user from JWT token
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        from .models import User
        return User.objects.get(id=user_id)
        
    except (jwt.InvalidTokenError, User.DoesNotExist):
        return None
