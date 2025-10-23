from rest_framework import serializers
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, UserProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    branch_slug = serializers.SlugField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 
                 'last_name', 'phone_number', 'user_type', 'branch_slug')
        extra_kwargs = {
            'user_type': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords don't match."})
        
        # Validate user type
        user_type = attrs.get('user_type')
        if user_type not in ['guest', 'member']:
            raise serializers.ValidationError({
                "user_type": "Invalid user type for registration."
            })
            
        return attrs
    
    def create(self, validated_data):
        branch_slug = validated_data.pop('branch_slug', None)
        user = User.objects.create_user(**validated_data)
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        # Generate verification token
        user.generate_verification_token()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    user_type = serializers.CharField(required=False)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        user_type = attrs.get('user_type')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), 
                              email=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            
            if not user.is_verified:
                raise serializers.ValidationError('Please verify your email address.')
            
            if user_type and user.user_type != user_type:
                raise serializers.ValidationError(f'Invalid user type for {user_type} login.')
            
            attrs['user'] = user
            return attrs
        
        raise serializers.ValidationError('Email and password are required.')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'
        read_only_fields = ('user',)

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'user_type', 
                 'phone_number', 'profile_picture', 'branch', 'branch_name',
                 'is_verified', 'profile', 'created_at')
        read_only_fields = ('id', 'email', 'is_verified', 'created_at')

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User with this email does not exist.')
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords don't match."})
        return attrs
