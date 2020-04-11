from flask_sqlalchemy import SQLAlchemy
import random
import os
import uuid

# Create db object using sqlalchemy
db = SQLAlchemy()


# =====================
# 	Global Variables
# =====================
USER_AVATARS = os.listdir('static/img/avatars/users')
CHANNEL_AVATARS = os.listdir('static/img/avatars/channels')



# =============================
#		Modals
# =============================

# =============================
#		Auth Modals
# =============================


# Table to store users information.
class User(db.Model):
	__tablename__ = "users"
	id = db.Column(db.Integer, primary_key=True)
	avatar = db.Column(db.String(50), nullable=False, default=random.choice(USER_AVATARS))
	fname = db.Column(db.String(20), nullable=False)
	lname = db.Column(db.String(20), nullable=True)
	email = db.Column(db.String(30), nullable=False, unique=True)
	password = db.Column(db.String(100), nullable=False)
	country = db.Column(db.String(20), nullable=True)
	is_email_confirmed = db.Column(db.Boolean, nullable=False, default=False)
	is_blocked = db.Column(db.Boolean, nullable=False, default=False)
	secret_key = db.Column(db.String(200), nullable=False, index=True)

	def __init__(self, fname, lname, email, password, country):
		self.fname = fname
		self.lname = lname
		self.email = email
		self.password = password
		self.country = country
		self.secret_key = email + '-' + str(uuid.uuid4())


	def reset_key(self):
		self.secret_key = self.email + '-' + str(uuid.uuid4())

# Table to store if user is online or offline.
class Status(db.Model):
	__tablename__ = "status"
	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
	is_online = db.Column(db.Boolean, nullable=False)

	def __init__(self, user_id, is_online):
		self.user_id = user_id
		self.is_online = is_online


# =============================
#		Friends Modals
# =============================

class Friend(db.Model):
	__tablename__ = "friends"

	id = db.Column(db.Integer, primary_key=True)
	user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
	friend_id = db.Column(db.Integer, db.ForeignKey('users.id'))
	request_accepted = db.Column(db.Boolean, default=False)
	is_blocked = db.Column(db.Boolean, default=False)

	def __init__(self, user_id, friend_id):
		self.user_id = user_id
		self.friend_of = friend_id

	def accept_request(self):
		self.request_accepted = True

	def block_request(self):
		self.is_blocked = True

"""
class Channel(db.Model):
	__tablename__ = "channels"

	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(20), nullable=False, unique=True)
	is_public = db.Column(db.Boolean, nullable=False, default=True)
	avatar = db.Column(db.String(50), nullable=False, default="default.jpg")
	created_by = db.Column(db.Integer, db.ForeignKey('users.id'))

	def __init__(self, name, avatar, created_by):
		self.name = name
		self.avatar = avatar
		self.created_by = created_by


class Notification(db.Model):
	__tablename__ = "notifications"

	id = db.Column(db.Integer, primary_key=True)
	message = db.Column(db.Text, nullable=False)
	user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
	created_on = db.Column(db.DateTime, nullable=False, server_default=db.text('now()'))

	def __init__(self, user, message):
		self.user_id = user.id
		self.message = message


class ChannelChats(db.Model):
	__tablename__ = "channelchats"

	id = db.Column(db.Integer, primary_key=True)
	channel_id = db.Column(db.Integer, db.ForeignKey('channels.id'))
	user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
	message = db.Column(db.Text, nullable=False)

	def __init__(self, channel, user, message):
		self.channel_id = channel.id
		self.user_id = user.id
		self.message = message


class Friends(db.Model):
	__tablename__ = "friends"

	id = db.Column(db.Integer, primary_key=True)
	friend_of = db.Column(db.Integer, db.ForeignKey('users.id'))
	friend_id = db.Column(db.Integer, db.ForeignKey('users.id'))

	def __init__(self, user, friend):
		self.user = user.id
		self.friend_of = friend.id
"""