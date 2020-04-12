from flask import Blueprint, request, jsonify
import sys
import re

# Import the modals file in parent directory
sys.path.insert(0, '..')
from modals import *

# Create application blueprint
friends = Blueprint('friends', __name__, template_folder="templates")


# ========================
#   Application Functions
# ========================


@friends.route('/all', methods=['POST'])
def get_all_friends():
    # Extract secret key
    secret_key = request.headers.get('AUTH_TOKEN')

    # Validate secret key
    result = validate_token(secret_key)
    if result['success'] == False:
        return jsonify(result)

    # Get the user info from result
    user = result['user']

    # Get all friends of the user.
    friend_ids_1 = Friend.query.filter_by(user_id=user['id'], request_accepted=True).all()

    # Get users who has friendship.
    friend_ids_2= Friend.query.filter_by(friend_id=user['id'], request_accepted=True).all()

    # Get all friends
    friends = []
    for friend in friend_ids_1:
        user = User.query.get(friend.friend_id)
        friends.append({
            "id": user.id,
            "avatar": "/static/img/avatars/users/"+user.avatar,
            "fname": user.fname,
            "lname": user.lname,
            "email": user.email,
            "country": user.country
            })

    for friend in friend_ids_2:
        user = User.query.get(friend.friend_id)
        friends.append({
            "id": user.id,
            "avatar": "/static/img/avatars/users/"+user.avatar,
            "fname": user.fname,
            "lname": user.lname,
            "email": user.email,
            "country": user.country
            })

    # Return user friends
    return jsonify({
        "success": True,
        "friends": friends
        })

@friends.route('/requests/', methods=['POST'])
def friend_requests():
    """Returns all pending friend requests."""

    # Get the secret key
    secret_key = request.headers.get('AUTH_TOKEN')

    # Validate auth token
    result = validate_token(secret_key)

    # Result will be json object if it is not true
    if result['success'] == False:
        return jsonify(result)

    # Get the user
    user = result['user']

    # Get all friend requests of the user.
    pending_ids = Friend.query.filter_by(user_id=user['id'], request_accepted=False, is_blocked=False).all()
    
    # Get all friends info
    pending_requests = []
    for friend in pending_ids:
        user = User.query.get(friend.friend_id)
        pending_requests.append({
            "id": user.id,
            "fname": user.fname,
            "lname": user.lname,
            "email": user.email,
            "country": user.country
            })

    return jsonify({
        "success": True,
        "requests": pending_requests
        })

@friends.route('/confirm/<string:friend_id>', methods=['POST'])
def confirm_request(friend_id):
    """Accepts friend request"""

    # Validate the friend id
    if not friend_id:
        return jsonify({
            "success": False,
            "error": "Please provide friend id."
            })

    # Get the secret key
    secret_key = request.headers.get('AUTH_TOKEN')

    # Validate auth token
    result = validate_token(secret_key)

    if result['success'] == False:
        return jsonify(result)

    # Get the user
    user = result['user']

    # Confirm friend request
    friend = Friend.query.filter_by(user_id=user['id'], friend_id=friend_id).first()
    
    # Check if friend not found.
    if not friend:
        return jsonify({
            "success": False,
            "error": "Invalid details provided. No friend found with provided details."
            })

    # Check if request is already accepted.
    if friend.request_accepted == True:
        return jsonify({
            "success": False,
            "error": "Friend request already accepted."
            })

    # Check if friend is blocked.
    if friend.is_blocked == True:
        return jsonify({
            "success": False,
            "error": "Friend is blocked by you."
            })

    # Accept the request
    friend.accept_request()
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Friend request accepted successfully."
        })

@friends.route('/reject/<string:friend_id>', methods=['POST'])
def reject_request(friend_id):
    """Accepts friend request"""

    # Validate the friend id
    if not friend_id:
        return jsonify({
            "success": False,
            "error": "Please provide friend id."
            })

    # Get the secret key
    secret_key = request.headers.get('AUTH_TOKEN')

    # Validate auth token
    result = validate_token(secret_key)

    if result['success'] == False:
        return jsonify(result)

    # Get the user
    user = result['user']

    # Confirm friend request
    friend = Friend.query.filter_by(user_id=user['id'], friend_id=friend_id).first()
    
    # Check if friend not found.
    if not friend:
        return jsonify({
            "success": False,
            "error": "Invalid details provided. No friend found with provided details."
            })

    # Check if request is already accepted.
    if friend.request_accepted == True:
        return jsonify({
            "success": False,
            "error": "Friend request already accepted."
            })

    # Check if friend is blocked.
    if friend.is_blocked == True:
        return jsonify({
            "success": False,
            "error": "Friend is already blocked by you."
            })

    # Accept the request
    friend.block_request()
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Friend request rejected successfully."
        })

@friends.route('/search/<string:email>', methods=['POST'])
def search_friend(email):
    """Search friend providing his email address"""

    # Make sure email is provided
    if not email:
        return jsonify({
            "success": False,
            "error": "Email not provided."
            })

    print(email)
    # Check if email is of correct format.
    if not validate_email(email):
        return jsonify({
            "success": False,
            "error": "Invalid email provided."
            })

    # Check if email is less than 9 characters
    if len(email) < 9:
        return jsonify({
            "success": False,
            "error": "Email should be more than 9 characters."
            })

    # Get the secret key
    secret_key = request.headers.get('AUTH_TOKEN')

    # validate auth token
    result = validate_token(secret_key)

    if result['success'] == False:
        return jsonify(result)

    # Search for the user.
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({
            "success": False,
            "error": "User with provided email do not exist."
            })

    user = {
        "id": user.id,
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "country": user.country
    }

    # Return user
    return jsonify({
        "success": True,
        "user": user
        })


@friends.route('/send/<string:friend_id>', methods=['POST'])
def send_request(friend_id):
    """Sends friend request to the person."""

    # Make sure user id is provided.
    if not friend_id:
        return jsonify({
            "success": False,
            "error": "Please provide your friend id."
            })

    # Get the secret key
    secret_key = request.headers.get('AUTH_TOKEN')

    # validate auth token
    result = validate_token(secret_key)

    if result['success'] == False:
        return jsonify(result)

    # Make sure the user exists with provided id.
    user_id = result['user']['id']

    # Make sure friend exists
    friend = User.query.get(friend_id)

    if not friend:
        return jsonify({
            "success": False,
            "error": "Friend with provided id does not exist."
            })

    # Check if user is blocked.
    if friend.is_blocked:
        return jsonify({
            "success": False,
            "error": "User with provided details is blocked."
            })

    # Check if request is already sent.
    is_sent = Friend.query.filter_by(user_id=user_id, friend_id=friend.id).count()

    if is_sent > 0:
        return jsonify({
            "success": False,
            "error": "Friend Request is already sent."
            })

    # Send request to the friend.
    friend = Friend(user_id=user_id, friend_id=friend.id)
    db.session.add(friend)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Request sent successfully."
        })


# ============================
#       Helper Functions
# ============================


def validate_token(secret_key):
    # Make sure secret key is provided
    if not secret_key:
        return {
            "success": False,
            "error": "Please provide secret key as auth token."
            }

    # Find the user with secret key
    user = User.query.filter_by(secret_key=secret_key).first()

    if not user:
        return {
            "success": False,
            "error": "Invalid secret key provided."
            }
    # Create user
    user = {
        "id": user.id,
        "fname": user.fname,
        "lname": user.lname,
        "email": user.email,
        "secret_key": user.secret_key,
        "country": user.country
    }

    # Return user.
    return {
        "success": True,
        "user": user
        }

def validate_email(email):
    # Remove whitespaces from email
    email = email.strip()

    # Validate email
    regex = '^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$'

    return re.search(regex, email)

