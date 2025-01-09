
# Backend (Flask)

## Overview
Overview of setting up and running this Flask application.

## Prerequisites
- **Python 3.8+**
- **MongoDB Atlas** or local MongoDB

## Setup Instructions

### 1. Clone the Repository
First, clone the project repository

### 2. Create and Activate a Virtual Environment
#### On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
Create a `.env` file in the (backend) project root with the following content:

```env
SECRET_KEY={secret_key}
MONGO_URI={mongo_db_uri}
```
Please contact Zakaria to get the values of the environment variables and be granted permission to access the database.

### 6. Run the Application

```bash
flask run
```

### 7. Testing the Application
Access the app via browser at: `http://127.0.0.1:5000/`

Use **Postman** or similar tools to test the API endpoints like `users/signup`, `users/login`, etc.

### 8. Deactivate Virtual Environment
When you're done, deactivate the virtual environment:

#### On macOS/Linux:
```bash
deactivate
```

#### On Windows:
```bash
venv\Scripts\deactivate
```

---

## License
MIT License
