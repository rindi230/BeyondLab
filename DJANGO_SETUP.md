# Django Backend Setup Guide

## Overview
This project now uses a Django backend for:
- User registration
- User login with token authentication
- Contact message submissions
- Admin panel for managing users and messages

## Quick Start

### 1. Install Django Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Database
```bash
python manage.py makemigrations
python manage.py migrate
```

### 3. Create Admin Account (Superuser)
```bash
python manage.py createsuperuser
# Follow the prompts to create your admin account
```

### 4. Run Django Server
```bash
python manage.py runserver
# Server will be available at http://localhost:8000
```

### 5. Access Admin Panel
- Go to `http://localhost:8000/admin/`
- Log in with your superuser credentials
- View:
  - **User Profiles**: All registered users
  - **Contact Messages**: All messages submitted through the contact form

## API Endpoints

### Authentication
- **POST** `/api/users/register/` - Register new user
- **POST** `/api/users/login/` - Login user and get token

### Contact
- **POST** `/api/contact/` - Submit contact message (public)
- **GET** `/api/users/my_messages/` - Get all messages (admin only)
- **PATCH** `/api/contact/{id}/mark_as_read/` - Mark message as read (admin only)

## Frontend Configuration
The frontend automatically connects to `http://localhost:8000/api` in development.

To change this, update `REACT_APP_DJANGO_API_URL` in your `.env` file:
```
REACT_APP_DJANGO_API_URL=http://localhost:8000/api
```

## Database Models

### UserProfile
- Automatically created when a user registers
- Stores user metadata

### ContactMessage
- name: User's name
- email: User's email
- subject: Message subject
- message: Message content
- created_at: Timestamp
- is_read: Read status (for admin)

## Admin Features
- View all registered users and their profiles
- View and manage contact messages
- Mark messages as read/unread
- Search and filter messages
