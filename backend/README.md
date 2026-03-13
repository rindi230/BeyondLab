# Setup instructions for Django backend

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   
   **Windows:**
   ```bash
   venv\Scripts\activate
   ```
   
   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Make migrations:
   ```bash
   python manage.py makemigrations
   ```

6. Apply migrations:
   ```bash
   python manage.py migrate
   ```

7. Create a superuser (admin):
   ```bash
   python manage.py createsuperuser
   ```

8. Run the development server:
   ```bash
   python manage.py runserver
   ```

The server will run on `http://localhost:8000`

## API Endpoints

### User Management
- **Register**: POST `/api/users/register/`
  ```json
  {
    "username": "username",
    "email": "email@example.com",
    "password": "securepassword",
    "password_confirm": "securepassword",
    "first_name": "John",
    "last_name": "Doe"
  }
  ```

- **Login**: POST `/api/users/login/`
  ```json
  {
    "username": "username",
    "password": "securepassword"
  }
  ```

### Contact Messages
- **Submit Message**: POST `/api/contact/`
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry",
    "message": "Your message here"
  }
  ```

- **View Messages** (Admin only): GET `/api/users/my_messages/`

- **Mark as Read** (Admin only): PATCH `/api/contact/{id}/mark_as_read/`

## Admin Panel
Access the Django admin panel at `/admin/` with your superuser credentials.
