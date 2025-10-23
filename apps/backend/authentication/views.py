from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

from .models import User
from .serializers import (
    UserRegistrationSerializer, 
    UserLoginSerializer,
    UserSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer
)
from .utils import generate_jwt_token, get_tokens_for_user

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Send verification email
            self._send_verification_email(user)
            
            return Response({
                'message': 'User registered successfully. Please check your email for verification.',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _send_verification_email(self, user):
        subject = 'Verify your THOGMi account'
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={user.verification_token}"
        message = f"""
        Welcome to THOGMi!
        
        Please verify your email address by clicking the link below:
        {verification_url}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response(
                {'error': 'Verification token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(verification_token=token)
            
            # Check if token is expired (24 hours)
            if user.verification_sent_at and \
               (timezone.now() - user.verification_sent_at).days >= 1:
                return Response(
                    {'error': 'Verification token has expired.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if user.verify_user(token):
                return Response({
                    'message': 'Email verified successfully. You can now log in.'
                })
            else:
                return Response({
                    'error': 'Invalid verification token.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid verification token.'
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            
            user_data = UserSerializer(user).data
            
            return Response({
                'message': 'Login successful',
                'tokens': tokens,
                'user': user_data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    def post(self, request):
        # With JWT, logout is handled on client side by removing tokens
        # We can implement token blacklisting here if needed
        return Response({
            'message': 'Logged out successfully'
        })

class UserProfileView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                reset_token = generate_jwt_token(user, token_type='reset')
                
                # Send password reset email
                self._send_reset_email(user, reset_token)
                
                return Response({
                    'message': 'Password reset instructions sent to your email.'
                })
                
            except User.DoesNotExist:
                # Don't reveal whether email exists
                return Response({
                    'message': 'If that email exists, reset instructions have been sent.'
                })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _send_reset_email(self, user, reset_token):
        subject = 'Reset your THOGMi password'
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        message = f"""
        You requested a password reset for your THOGMi account.
        
        Click the link below to reset your password:
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            # Verify and decode token
            from .utils import verify_jwt_token
            payload = verify_jwt_token(token, token_type='reset')
            
            if not payload:
                return Response({
                    'error': 'Invalid or expired reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                user = User.objects.get(id=payload['user_id'])
                user.set_password(new_password)
                user.save()
                
                return Response({
                    'message': 'Password reset successfully.'
                })
                
            except User.DoesNotExist:
                return Response({
                    'error': 'User not found.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def resend_verification_email(request):
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = User.objects.get(email=email)
        
        if user.is_verified:
            return Response({
                'error': 'Email is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.generate_verification_token()
        
        # Resend verification email
        subject = 'Verify your THOGMi account'
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={user.verification_token}"
        message = f"""
        Please verify your email address by clicking the link below:
        {verification_url}
        
        This link will expire in 24 hours.
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'Verification email sent successfully.'
        })
        
    except User.DoesNotExist:
        return Response({
            'error': 'User with this email does not exist.'
        }, status=status.HTTP_400_BAD_REQUEST)
