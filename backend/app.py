from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    logout_user,
    login_required,
    current_user,
)
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import uuid

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SECRET_KEY"] = "secret123"
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"],
)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    last_name = db.Column(db.String(150))
    bio = db.Column(db.Text)
    avatar = db.Column(db.String(255))
    password = db.Column(db.String(150), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401

@app.route("/")
def index():
    return jsonify({"message": "Backend is running"})

@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    email = request.form.get("email")
    password = request.form.get("password")
    last_name = request.form.get("lastName")
    bio = request.form.get("bio")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if User.query.filter(
        (User.username == username) | (User.email == email)
    ).first():
        return jsonify({"error": "User already exists"}), 400

    avatar_filename = None
    file = request.files.get("avatar")

    if file and allowed_file(file.filename):
        ext = file.filename.rsplit(".", 1)[1].lower()
        avatar_filename = f"{uuid.uuid4()}.{ext}"
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], avatar_filename))

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        username=username,
        email=email,
        last_name=last_name,
        bio=bio,
        avatar=avatar_filename,
        password=hashed_pw,
    )

    db.session.add(user)
    db.session.commit()

    login_user(user)

    return jsonify({"message": "User registered"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get("username")).first()

    if user and bcrypt.check_password_hash(user.password, data.get("password")):
        login_user(user)
        return jsonify({"message": "Login successful"})

    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "lastName": current_user.last_name,
        "bio": current_user.bio,
        "avatar": current_user.avatar,
    })

@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

@app.route("/change-password", methods=["POST"])
@login_required
def change_password():
    data = request.get_json()

    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"error": "Все поля обязательны"}), 400

    user = current_user

    if not bcrypt.check_password_hash(user.password, old_password):
        return jsonify({"error": "Старый пароль неверен"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "Пароль должен быть минимум 6 символов"}), 400

    user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()

    return jsonify({"message": "Пароль успешно изменён"})

@app.route("/change-username", methods=["POST"])
@login_required
def change_username():
    data = request.get_json()
    new_username = data.get("username")

    if not new_username:
        return jsonify({"error": "Имя не может быть пустым"}), 400

    if User.query.filter_by(username=new_username).first():
        return jsonify({"error": "Имя уже занято"}), 400

    current_user.username = new_username
    db.session.commit()

    return jsonify({"message": "Имя успешно изменено"})

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True, host="localhost", port=5000)