from flask import Blueprint, request, jsonify
import sys
import re

# Import the modals file in parent directory
sys.path.insert(0, '..')
from modals import *

# Create application blueprint
auth = Blueprint('auth', __name__, template_folder="templates")


# ========================
#   Application Functions
# ========================

@auth.route('/login', methods=['POST'])
def login():
    # Check if request contains secret key
    secret_key = request.headers.get('AUTH_TOKEN')
    print(request.headers)

    if secret_key:
        return login_via_key(secret_key)

    else:
        # Fetch the credentials
        email = request.form.get('email')
        password = request.form.get('password')

        if not email or not password:
            return jsonify({
                "success": False,
                "error": "Email and password are required."
                })

        # Validate email
        isValid = validate_email(email)
        if not isValid:
            return jsonify({
                "success": False,
                "error": "Invalid email provided."
                })

        # Validate password
        if len(password) < 6:
            return jsonify({
                "success": False,
                "error": "Password should be more than 6 characters."
                })


        return login_via_credentials(email, password)

        
@auth.route('/check/<int:user_id>', methods=['GET'])
def check_online_status(user_id):

    # Check if user with provided id exists
    user = User.query.get(user_id)

    if not user:
        return jsonify({
            "success": False,
            "error": "Invalid user id provided."
            })

    # Get status of the user.
    status = Status.query.filter_by(user_id=user_id).first()

    # Check if status is available for current user.
    if not status:
        return jsonify({
            "success": True,
            "status": "offline"
            })

    print(status)
    # Get the online status
    status = "online" if status.is_online else "offline"
    
    return jsonify({
        "success": True,
        "status": status
        })


@auth.route('/register', methods=['POST'])
def register_user():
    # Extract information related to user.
    fname = request.form.get('fname')
    lname = request.form.get('lname')
    email = request.form.get('email')
    password = request.form.get('password')
    country = request.form.get('country')

    # Make sure fname, lname, email, password, country are provided
    if not fname or not lname or not email or not password or not country:
        return jsonify({
            "success": False,
            "error": "first name, last name, email, password and country are required for signup. Please provide required credentials."
            })

    # Validate email
    if not validate_email(email):
        return jsonify({
            "success": False,
            "error": "Invalid email address provided."
            })
    

    # Validate fname, lname, email, length
    if len(fname) < 3 or len(lname)  < 3:
            return jsonify({
                "success": False,
                "error": "First and last name should be more than 3 characters."
                })

    if len(email) < 9:
        return jsonify({
            "success": False,
            "error": "Email should be more than 9 characters."
            })

    if len(password) < 6:
        return jsonify({
            "success": False,
            "error": "Password should be more than 6 characters."
            })

    if len(country) < 2:
        return jsonify({
            "success": False,
            "error": "Country code should be more than 2 characters in length"
            })


    # Check is user already exists with provided email
    found = User.query.filter_by(email=email).count()

    if found > 0:
        return jsonify({
            "success": False,
            "error": "User with provided email already exists."
            })

    # Create a new user
    user = User(
        fname=fname, 
        lname=lname,
        email=email,
        password=password,
        country=country
        )

    try:
        db.session.add(user)
        db.session.commit()

        # Create new user status offline
        update_user_online_status(user.id, False)

        # Send account confirmation email

        return jsonify({
            "success": True,
            "secret_key": user.secret_key
            })
    except Exception as ex:
        print(ex)
        return jsonify({
            "success": False,
            "error": "Required field missing."
            })

@auth.route('/logout', methods=['POST'])
def logout():
    key = request.headers.get('AUTH_TOKEN')

    # Get the user from database
    user = User.query.filter_by(secret_key=key).first()

    # Check if invalid key is provided
    if not user:
        return jsonify({
            "success": False,
            "error": "Invalid secret key provided."
            })

    # Update user status to offline
    update_user_online_status(user.id, False)

    # Reset Secret key of user.
    user.reset_key()
    db.session.commit()

    # Return success message
    return jsonify({
        "success": True,
        "message": "User logged out successfully."
        })

# ============================
#       Helper functions
# ============================
def validate_email(email):
    # Validate email
    regex = '^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'

    return re.search(regex, email)


def login_via_key(key):
    # Split the key
    email = key.split('-')[0].strip()

    # Validate the secret key
    user = User.query.filter_by(email=email, secret_key=key).first()

    # Check if invalid credentials
    if not user:
        return jsonify({
            "success": False,
            "error": "Invalid secret key provided."
            })

    # Check if email is confirmed.
    if not user.is_email_confirmed:
        return jsonify({
            "success": False,
            "error": "Email address is not confirmed. Please open your email and confirm your account."
            })

    # Check if user is blocked
    if user.is_blocked:
        return jsonify({
            "success": False,
            "error": "Your account is blocked. In case of error from our side, please file a report at contact us page."
            })

    user_info = {
    "id": user.id,
    "avatar": user.avatar,
    "fname": user.fname,
    "lname": user.lname,
    "email": user.email,
    "secret_key": user.secret_key,
    "country": user.country,
    }

    # change user status to online.
    update_user_online_status(user.id, True)

    return jsonify({
        "success": True,
        "user": user_info
        })


def login_via_credentials(email, password):
    # Validate the user
    user = User.query.filter_by(email=email, password=password).first()

    # Check is user does not exist.
    if not user:
        return jsonify({
            "success": False,
            "error": "Invalid Credentials provided."
            })

    # Check if email is confirmed.
    if not user.is_email_confirmed:
        return jsonify({
            "success": False,
            "error": "Email address is not confirmed. Please open your email and confirm your account."
            })

    # Check if user is blocked
    if user.is_blocked:
        return jsonify({
            "success": False,
            "error": "Your account is blocked. In case of error from our side, please file a report at contact us page."
            })

    # Change user status to online
    update_user_online_status(user.id, True)

    # Check if user exists
    return jsonify({
        "success": True,
        "secret_key": user.secret_key
        })


def update_user_online_status(user_id, is_online):
    # change user status to online.
    status = Status.query.filter_by(user_id=user_id).first()

    if not status:
        # Create new status for user.
        status = Status(user_id=user_id, is_online=is_online)
        db.session.add(status)
        db.session.commit()

    # Update user status
    status.is_online = is_online
    db.session.commit()

