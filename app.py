from flask import Flask
from api.auth import auth
from api.friends import friends
from api.channels import channels
from webpages import pages
from modals import *

# Create a flask app
app = Flask(__name__)


# =========================
#	Environment Variables
# =========================

if not os.getenv('DATABASE_URL'):
	raise Exception("Database url is not set.")
"""
if not os.getenv('MAIL_URL'):
	raise Exception("Mail URL is not set.")

if not os.getenv("MAIL_KEY"):
	raise Exception("Mail secret key is not set.")
"""

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