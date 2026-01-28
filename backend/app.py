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
from datetime import timedelta
import os
import json

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SECRET_KEY"] = "secret123"

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=30)
app.config["REMEMBER_COOKIE_DURATION"] = timedelta(days=30)
app.config["REMEMBER_COOKIE_HTTPONLY"] = True
app.config["REMEMBER_COOKIE_SAMESITE"] = "Lax"

UPLOAD_FOLDER = "uploads/avatars"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"],
)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    last_name = db.Column(db.String(150), nullable=True)
    password = db.Column(db.String(150), nullable=False)
    avatar = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.String(500), nullable=True)

    def __init__(self, username: str, password: str, last_name: str | None = None, 
                 avatar: str | None = None, bio: str | None = None):
        self.username = username
        self.password = password
        self.last_name = last_name
        self.avatar = avatar
        self.bio = bio


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    content = db.Column(db.Text, nullable=True)
    media = db.Column(db.Text, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    

    user = db.relationship("User", backref=db.backref("posts", lazy=True))
    likes = db.relationship("Like", backref="post", cascade="all, delete")
    comments = db.relationship("Comment", backref="post", cascade="all, delete")

    def __init__(self, title: str, user_id: int, content: str | None = None, media: str | None = None):
        self.title = title
        self.user_id = user_id
        self.content = content
        self.media = media

    def to_dict(self, current_user_id=None):
        my_comments_count = 0

        if current_user_id:
            my_comments_count = Comment.query.filter_by(
                post_id=self.id,
                user_id=current_user_id
            ).count()
        return {
        "id": self.id,
        "title": self.title,
        "content": self.content or "",
        "media": json.loads(self.media) if self.media else [],
        "author": {
            "id": self.user.id,
            "username": self.user.username,
            "avatar": (
                f"http://localhost:5000/avatars/{self.user.avatar}"
                if self.user.avatar else None
            ),
        },
        "comments_count": Comment.query.filter_by(
        post_id=self.id
        ).count(),
        "my_comments_count": my_comments_count,
        "likes": [
            {
                "id": like.user.id,
                "username": like.user.username,
                "avatar": (
                    f"http://localhost:5000/avatars/{like.user.avatar}"
                    if like.user.avatar else None
                ),
            }
            for like in self.likes
        ],
        "comments": [
            {
                "id": comment.id,
                "text": comment.text,
                "author": {
                    "id": comment.user.id,
                    "username": comment.user.username,
                    "avatar": (
                        f"http://localhost:5000/avatars/{comment.user.avatar}"
                        if comment.user.avatar else None
                    ),
                },
            }
            for comment in self.comments
        ],
    }

    
class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    user = db.relationship("User")

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("post.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    user = db.relationship("User")

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401

@app.route("/")
def index():
    return jsonify({"message": "Backend is running"})

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
    if avatar and avatar.filename:
        filename = secure_filename(avatar.filename)
        avatar_filename = f"{username}_{filename}"
        avatar.save(os.path.join(app.config["UPLOAD_FOLDER"], avatar_filename))

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(
        username=username,
        last_name=last_name,
        password=hashed_pw,
        bio=bio,
        avatar=avatar_filename
    )

    db.session.add(user)
    db.session.commit()

    login_user(user, remember=True)

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user, remember=True)
        return jsonify({"message": "Login successful"})

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/users/<username>", methods=["GET"])
def get_user_by_username(username):
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "last_name": user.last_name,
        "bio": user.bio,
        "avatar": (
            f"http://localhost:5000/avatars/{user.avatar}"
            if user.avatar
            else None
        ),
    })

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

@app.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

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

@app.route("/avatars/<filename>")
def avatars(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

@app.route("/posts", methods=["POST"])
@login_required
def create_post():
    data = request.get_json() or {}
    title = data.get("title")
    content = data.get("content")
    media = data.get("media")

    if not title:
        return jsonify({"error": "Title is required"}), 400

    post = Post(
        title=title,
        content=content,
        media=json.dumps(media) if media else None,
        user_id=current_user.id
    )

    db.session.add(post)
    db.session.commit()

    return jsonify({"message": "Post created", "post": post.to_dict()}), 201

@app.route("/users/<username>/posts", methods=["GET"])
def get_posts_by_user(username):
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    posts = Post.query.filter_by(user_id=user.id).order_by(Post.id.desc()).all()

    posts_data = [post.to_dict() for post in posts]

    return jsonify(posts_data)


@app.route("/posts", methods=["GET"])
def get_all_posts():
    posts = Post.query.order_by(Post.id.desc()).all()
    return jsonify([post.to_dict() for post in posts])


@app.route("/my-posts", methods=["GET"])
@login_required
def get_my_posts():
    posts = Post.query.filter_by(user_id=current_user.id).order_by(Post.id.desc()).all()
    return jsonify([post.to_dict() for post in posts])

@app.route("/posts/<int:post_id>/like", methods=["POST"])
@login_required
def toggle_like(post_id):
    post = Post.query.get_or_404(post_id)

    existing = Like.query.filter_by(
        post_id=post.id,
        user_id=current_user.id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({"liked": False})

    like = Like(post_id=post.id, user_id=current_user.id)
    db.session.add(like)
    db.session.commit()

    return jsonify({"liked": True})

@app.route("/posts/<int:post_id>", methods=["GET"])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)

    return jsonify(
        post.to_dict(
            current_user_id=current_user.id
            if current_user.is_authenticated else None
        )
    )

@app.route("/posts/<int:post_id>/comments", methods=["POST"])
@login_required
def add_comment(post_id):
    post = Post.query.get_or_404(post_id)
    data = request.get_json() or {}
    text = data.get("text")

    if not text:
        return jsonify({"error": "Comment text required"}), 400

    comment = Comment(
        text=text,
        post_id=post.id,
        user_id=current_user.id
    )

    db.session.add(comment)
    db.session.commit()

    return jsonify(comment={
        "id": comment.id,
        "text": comment.text,
        "author": {
            "id": current_user.id,
            "username": current_user.username,
            "avatar": (
                f"http://localhost:5000/avatars/{current_user.avatar}"
                if current_user.avatar else None
            ),
        },
    }), 201

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True, host="localhost", port=5000)