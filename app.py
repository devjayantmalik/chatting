from flask import Flask
from api.auth import auth
from modals import *

# Create a flask app
app = Flask(__name__)


# Configure the sqlalchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the databse
db.init_app(app)


# =========================
#	Flask blueprints
# =========================
app.register_blueprint(auth, url_prefix="/auth")


if __name__ == "__main__":
	with app.app_context():
		db.create_all()