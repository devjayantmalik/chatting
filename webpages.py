from flask import Blueprint, render_template


pages = Blueprint('pages', __name__, template_folder="templates")

@pages.route('/')
def index():
	return render_template('index.html')

@pages.route('/login')
def signin():
	return render_template('sign-in.html')

@pages.route('/signup')
def signup():
	return render_template('sign-up.html')