# Security/Privacy Feature: Real-Time User Authentication

## Overview
For this project, we implemented a **real-time user authentication feature** to enhance the security and privacy of the application. Previously, the authentication logic relied on storing the `isAuth` state in `localStorage`. This approach caused a significant security issue: if the session cookie expired, the frontend would incorrectly consider the user as authenticated due to the persistent `isAuth` flag in `localStorage`. This could lead to unauthorized access.

To address this problem, I redesigned the authentication system to verify the user's session status dynamically via a backend API. This ensures that the authentication status always reflects the validity of the session cookie.

Now, there is a `useEffect` in the frontend that makes a request to this API after every render, ensuring that if the session cookie expires, the user is immediately logged out.

ALSO, we added a user_type cookie that stores the user type in a cookie, before, we had the user type in a query parameter, allowing users to modify their user type and preform unauthorized actions. But we changed that, to instead use the previously stated backend API to also return the user type as a cookie, and if a user were to modify said cookie, they will be immediately logged out.

So we actually implemented two new security features :)

---

## Implementation Details

### Backend Changes
- Added a new `/auth` endpoint in the backend to validate the user's session. The endpoint:
  - Extracts the `access_token_cookie` and `user_type` from the user's cookies.
  - Decodes the token using a secret key to verify its authenticity and retrieve the user ID.
  - Queries the database to confirm the user's existence based on their `user_type` (volunteer or organization).
  - Returns user details and the authentication status if the token is valid, or an appropriate error if it has expired or is invalid.

#### Backend Code Snippet
```python
@users.route('/auth', methods=['GET'])
def auth():
    token = request.cookies.get('access_token_cookie')
    user_type = request.cookies.get('user_type')

    if not token:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        decoded = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = decoded.get('sub')
        db = current_app.db

        if user_type == 'volunteer':
            user = db['users'].find_one({'_id': ObjectId(user_id)})
        elif user_type == 'organization':
            user = db['organizations'].find_one({'_id': ObjectId(user_id)})
        else:
            return jsonify({'error': 'Invalid user type'}), 400

        if user:
            return jsonify({
                'msg': 'Authenticated',
                'userType': user_type,
                'user': {
                    'id': str(user['_id']),
                    'email': user['email'],
                    'userType': user_type
                }
            }), 200
        else:
            return jsonify({'error': 'User not found'}), 404

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Unauthorized - Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Unauthorized - Invalid token'}), 401