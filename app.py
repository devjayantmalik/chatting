from flask import Flask
from flask_socketio import SocketIO
from api.auth import auth
from api.friends import friends
from api.channels import channels
from webpages import pages
from modals import *

# Create a flask app
app = Flask(__name__)

socketio = SocketIO(app)
# =========================
#	Environment Variables
# =========================



if not os.getenv('DATABASE_URL'):
	raise Exception("Database url is not set.")


# check all the mail related variables are set
if not os.getenv('MAIL_SENDER_NAME'):
	raise Exception("MAIL_SENDER_NAME is not set in environment variables.")

if not os.getenv('MAIL_SENDER_EMAIL'):
	raise Exception("MAIL_SENDER_EMAIL is not set in environment variables.")

if not os.getenv('MAIL_SERVER_HOST'):
	raise Exception("MAIL_SERVER_HOST is not set in environment variables.")

if not os.getenv('MAIL_SERVER_PORT'):
	raise Exception("MAIL_SERVER_PORT is not set in environment variables.")

if not os.getenv('MAIL_SERVER_USERNAME'):
	raise Exception("MAIL_SERVER_USERNAME is not set in environment variables.")

if not os.getenv('MAIL_SERVER_PASSWORD'):
	raise Exception("MAIL_SERVER_PASSWORD is not set in environment variables.")

# Configure the sqlalchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Initialize the databse
db.init_app(app)


# =========================
#	Flask blueprints
# =========================
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(friends, url_prefix="/friends")
app.register_blueprint(channels, url_prefix="/channels")
app.register_blueprint(pages)


if __name__ == "__main__":
	with app.app_context():
		db.create_all()
		
		
		