from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import UserProfile, ContactMessage


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        # Normalize email and ensure it's present
        email = data.get('email')
        if not email:
            raise serializers.ValidationError({"email": "Email is required."})

        email = email.lower().strip()
        data['email'] = email

        # Use email as username if username not provided
        username = data.get('username') or email
        data['username'] = username

        # Check for existing user by username or email
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({"username": ["A user with that username already exists."]})
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": ["A user with that email already exists."]})

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        # Ensure username is set to email if missing
        username = validated_data.get('username')
        email = validated_data.get('email')
        if not username and email:
            username = email
            validated_data['username'] = username

        # Create user using Django helper which handles password hashing
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=password,
        )

        # Create a profile entry (guarded in case migrations haven't been applied yet)
        try:
            UserProfile.objects.create(user=user)
        except Exception as e:
            # Log to console during development and continue; migrations should be applied.
            import sys
            print("Warning: could not create UserProfile:", e, file=sys.stderr)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at']
