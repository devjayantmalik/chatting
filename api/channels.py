from flask import Blueprint, request, jsonify
import sys
import re
from datetime import datetime, timedelta


# Import the modals file in parent directory
sys.path.insert(0, '..')
from modals import *

# Create application blueprint
channels = Blueprint('channels', __name__, template_folder="templates")

# ========================
#   Application Functions
# ========================
@channels.route("/subscribed", methods=['POST'])
def subscribed_channels():
	"""Returns list of subscribed channels by the user."""

	secret_key = request.headers.get('AUTH_TOKEN')

	result = validate_token(secret_key)

	if result['success'] == False:
		return jsonify(result)

	# Get the user
	user = result['user']

	# Get subscribed channels of the user.
	subscribed = Subscription.query.filter_by(user_id=user['id']).all()

	# Prepare list of channels
	channels = []
	for channel in subscribed:
		# Get channel by its id
		ch = Channel.query.get(channel.channel_id)

		# Get the user who created channel
		user = User.query.get(ch.created_by)

		# Append to list of subscribed channels
		channels.append({
			"id": ch.id,
			"name": ch.name,
			"avatar": ch.avatar,
			"created_by": user.fname + " " + user.lname,
			"created_on": ch.created_on,
			"description": ch.description
			})

	return jsonify({
		"success": True,
		"channels": channels
		})


@channels.route('/categories', methods=['GET'])
def get_categories():
	"""Returns list of all categories"""
	categories = ChannelCategory.query.filter_by().all()

	# Prepare result
	result = []
	for category in categories:
		result.append({
			"id": category.id,
			"title": category.title
			})

	return jsonify({
		"success": True,
		"categories": result
		})


@channels.route('/public/latest', methods=['GET'])
def latest_public_channels():
	pass


@channels.route('/search/<string:name>', methods=['POST'])
def search_channels(name):
	secret_key = request.headers.get('AUTH_TOKEN')

	result = validate_token(secret_key)

	if result['success'] == False:
		return jsonify(result)

	# Get the search results of channels
	channels = Channel.query.filter_by(and_(Channel.name.like(f'%{name}%'))).all()

	# Return found channels
	return jsonify({
		"success": True,
		"channels": channels
		})


@channels.route('/chats/public/<int:channel_id>', methods=['POST'])
def get_public_channel_chats(channel_id):

	# Get the secret key
	secret_key = request.headers.get('AUTH_TOKEN')

	# Validate the secret key
	result = validate_token(secret_key)

	# If key is invalid return error.
	if result['success'] == False:
		return jsonify(result)

	# Get the user.
	user = result['user']

	# Get the chats
	chats = ChannelChat.query.filter_by(channel_id=channel_id).all()

	if not chats:
		return jsonify({
			"success": False,
			"error": "Provided channel not found."
			})

	max_chats = 1000
	response = []
	for chat in chats:
		user_info = User.query.get(chat.sent_by).first()
		channel_info = Channel.query.get(chat.sent_on).first()
		category = ChannelCategory.query.get(channel.category_id)
		message = chat.message
		sent_at = chat.sent_at

		user = {
			"fname": user_info.fname,
			"lname": user_info.lname,
			"email": user_info.email,
			"country": user_info.country
		}
		channel = {
			"name": channel.name,
			"avatar": channel.avatar,
			"description": channel.description,
			"category": category.id
		}

		response.append({
			"user": user,
			"channel": channel,
			"message": message,
			"sent_at": sent_at
			})

		# Decrement the max_chats
		max_chats -= 1

		# Check if max_chats limit is reached
		if(max_chats <= 0):
			break

	return jsonify(response)


@channels.route('/create', methods=['POST'])
def create_channel():
	try:
		# Get the secret key
		secret_key = request.headers.get('AUTH_TOKEN')

		# Validate the secret key
		result = validate_token(secret_key)

		# If key is invalid return error.
		if result['success'] == False:
			return jsonify(result)

		# Get the user.
		user = result['user']

		# Get information related to channel
		channel_name = request.body.get('name')
		category = request.body.get('category')
		description = request.body.get('description')

		# Validate the channel name
		if not channel_name:
			return jsonify({
				"success": False,
				"error": "Please provide channel name."
				})

		# Validate channel description
		if len(description) > 100:
			return jsonify({
				"success": False,
				"error": "Description cannot be more than 100 characters."
				})

		# Validate Category
		category = ChannelCategory.query.get(category);
		if not category:
			return jsonify({
				"success": False,
				"error": "Invalid channel category provided."
				})

		# Create new channel
		try:
			channel = Channel(name=channel_name, created_by=user['id'], description=description, category_id=category.id)
			db.session.add(channel)
			db.session.commit()

			channel = {
				"id": channel.id,
				"name": channel.name,
				"avatar": channel.avatar,
				"created_on": channel.created_on,
				"description": channel.description,
				"category": category.title
			}

			return jsonify({
				"success": True,
				"channel": channel
				})

		except Exception:
			return jsonify({
				"success": False,
				"error": "Channel creation error occured."
				})

	except Exception:
		return jsonify({
			"success": False,
			"error": "Server Error occured."
			})

# ========================
#   Helper Functions
# ========================

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
