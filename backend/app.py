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

# ---------------- CONFIG ----------------

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SECRET_KEY"] = "secret123"

# cookies
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True

# uploads
UPLOAD_FOLDER = "uploads/avatars"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# ---------------------------------------

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"],
)

# ---------------- MODEL -----------------

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    last_name = db.Column(db.String(150), nullable=True)
    password = db.Column(db.String(150), nullable=False)
    avatar = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.String(500), nullable=True) 

# ---------------------------------------

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401


# ---------------- ROUTES ----------------

@app.route("/")
def index():
    return jsonify({"message": "Backend is running"})


# ---------- REGISTER (with avatar) ----------

@app.route("/register", methods=["POST"])
def register():
    username = request.form.get("username")
    password = request.form.get("password")
    last_name = request.form.get("last_name")
    bio = request.form.get("bio")
    avatar = request.files.get("avatar")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400

    avatar_filename = None
    if avatar:
        filename = secure_filename(avatar.filename)
        avatar_filename = f"{username}_{filename}"
        avatar.save(os.path.join(app.config["UPLOAD_FOLDER"], avatar_filename))

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        username=username,
        last_name=last_name,
        password=hashed_pw,
        bio=bio,
        avatar=avatar_filename,
    )

    db.session.add(user)
    db.session.commit()

    login_user(user)

    return jsonify({"message": "User registered successfully"}), 201


# ---------- LOGIN ----------

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"message": "Login successful"})

    return jsonify({"error": "Invalid credentials"}), 401


# ---------- CURRENT USER ----------

@app.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify(
        {
            "id": current_user.id,
            "username": current_user.username,
            "last_name": current_user.last_name,
            "bio": current_user.bio,
            "avatar": (
                f"http://localhost:5000/avatars/{current_user.avatar}"
                if current_user.avatar
                else None
            ),
        }
    )


# ---------- LOGOUT ----------

@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})


# ---------- CHANGE PASSWORD ----------

@app.route("/change-password", methods=["POST"])
@login_required
def change_password():
    data = request.get_json() or {}
    current_pw = data.get("current_password")
    new_pw = data.get("new_password")

    if not current_pw or not new_pw:
        return jsonify({"error": "Missing data"}), 400

    if not bcrypt.check_password_hash(current_user.password, current_pw):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new_pw) < 6:
        return jsonify({"error": "Password too short"}), 400

    current_user.password = bcrypt.generate_password_hash(new_pw).decode("utf-8")
    db.session.commit()

    return jsonify({"message": "Password changed successfully"})


# ---------- CHANGE USERNAME ----------

@app.route("/change-username", methods=["POST"])
@login_required
def change_username():
    data = request.get_json() or {}
    new_username = data.get("new_username")

    if not new_username or len(new_username) < 3:
        return jsonify({"error": "Invalid username"}), 400

    if User.query.filter_by(username=new_username).first():
        return jsonify({"error": "Username already taken"}), 400

    current_user.username = new_username
    db.session.commit()

    return jsonify({"message": "Username changed"})


# ---------- AVATAR FILES ----------

@app.route("/avatars/<filename>")
def avatars(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


# ---------------------------------------

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True, host="localhost", port=5000)