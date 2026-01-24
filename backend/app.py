from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
import re
import html
from sqlalchemy import text

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///simple_forum.db'
app.config['SECRET_KEY'] = 'secret123'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Создаем папку для загрузок
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

# CORS
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# === МОДЕЛИ ===
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    avatar = db.Column(db.String(200), default='default.png')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    email = db.Column(db.String(150), unique=True)
    bio = db.Column(db.Text, default='')
    
    posts = db.relationship('Post', backref='author', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, username=None, password=None, email=None, bio=None, avatar=None):
        self.username = username
        self.password = password
        self.email = email
        self.bio = bio
        if avatar:
            self.avatar = avatar

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    post_type = db.Column(db.String(20), default='post')  # 'post' или 'question'
    likes_count = db.Column(db.Integer, default=0)
    dislikes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __init__(self, title=None, content=None, image=None, user_id=None, post_type='post'):
        self.title = title
        self.content = content
        self.image = image
        self.user_id = user_id
        self.post_type = post_type

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    
    def __init__(self, content=None, user_id=None, post_id=None):
        self.content = content
        self.user_id = user_id
        self.post_id = post_id

class PostReaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    reaction_type = db.Column(db.String(10), nullable=False)  # 'like' или 'dislike'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_post_reaction'),)
    
    def __init__(self, user_id=None, post_id=None, reaction_type=None):
        self.user_id = user_id
        self.post_id = post_id
        self.reaction_type = reaction_type

class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    color = db.Column(db.String(7), default='#3B82F6')  # hex цвет
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, name=None, color=None):
        self.name = name
        if color:
            self.color = color

class PostTag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey('tag.id'), nullable=False)
    
    __table_args__ = (db.UniqueConstraint('post_id', 'tag_id', name='unique_post_tag'),)
    
    def __init__(self, post_id=None, tag_id=None):
        self.post_id = post_id
        self.tag_id = tag_id

class Bookmark(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'post_id', name='unique_user_post_bookmark'),)
    
    def __init__(self, user_id=None, post_id=None):
        self.user_id = user_id
        self.post_id = post_id

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'comment', 'like', 'mention'
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    related_post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, user_id=None, type=None, title=None, message=None, related_post_id=None):
        self.user_id = user_id
        self.type = type
        self.title = title
        self.message = message
        self.related_post_id = related_post_id

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(50), nullable=False)  # emoji или название иконки
    condition_type = db.Column(db.String(50), nullable=False)  # 'posts', 'likes', 'comments'
    condition_value = db.Column(db.Integer, nullable=False)
    
    def __init__(self, name=None, description=None, icon=None, condition_type=None, condition_value=None):
        self.name = name
        self.description = description
        self.icon = icon
        self.condition_type = condition_type
        self.condition_value = condition_value

class UserAchievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_id = db.Column(db.Integer, db.ForeignKey('achievement.id'), nullable=False)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user_id', 'achievement_id', name='unique_user_achievement'),)
    
    def __init__(self, user_id=None, achievement_id=None):
        self.user_id = user_id
        self.achievement_id = achievement_id

class ChatMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __init__(self, sender_id=None, receiver_id=None, content=None):
        self.sender_id = sender_id
        self.receiver_id = receiver_id
        self.content = content

class ChatRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user2_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('user1_id', 'user2_id', name='unique_chat_room'),)
    
    def __init__(self, user1_id=None, user2_id=None):
        self.user1_id = user1_id
        self.user2_id = user2_id

# === HELPER FUNCTIONS ===
def sanitize_text(text):
    """Санитизация пользовательского ввода для защиты от XSS"""
    if not text:
        return ""
    # Экранируем HTML специальные символы
    return html.escape(text.strip())

def validate_username(username):
    """Валидация имени пользователя"""
    if not username or len(username) < 3 or len(username) > 50:
        return False
    # Только буквы, цифры и подчеркивания
    return re.match(r'^[a-zA-Z0-9_а-яА-Я]+$', username) is not None

def validate_password(password):
    """Валидация пароля"""
    if not password or len(password) < 6 or len(password) > 128:
        return False
    return True

def validate_email(email):
    """Простая валидация email"""
    if not email or len(email) > 150:
        return False
    # Простой regex для email
    return re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email) is not None

def validate_post_content(title, content):
    """Валидация содержимого поста"""
    if not title or not content:
        return False, "Заголовок и содержимое обязательны"
    
    if len(title) > 200:
        return False, "Заголовок слишком длинный (максимум 200 символов)"
    
    if len(content) > 2000:
        return False, "Содержимое слишком длинное (максимум 2000 символов)"
    
    return True, ""

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        return unique_filename
    return None

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401

# === ROUTES ===

# Авторизация
@app.route('/register', methods=['POST'])
def register():
    avatar_filename = None
    if request.content_type and 'multipart/form-data' in request.content_type:
        form = request.form
        username = form.get('username', '').strip()
        email = form.get('email', '').strip()
        password = form.get('password', '').strip()
        bio = form.get('bio', '').strip()

        # Обработка аватара
        if 'avatar' in request.files:
            f = request.files['avatar']
            if f and f.filename:
                avatar_filename = save_file(f)
                if not avatar_filename:
                    return jsonify({"error": "Неверный формат аватарки"}), 400
    else:
        data = request.get_json() or {}
        username = (data.get('username') or '').strip()
        email = (data.get('email') or '').strip()
        password = (data.get('password') or '').strip()
        bio = (data.get('bio') or '').strip()

    # Валидация входных данных
    if not validate_username(username):
        return jsonify({"error": "Неверное имя пользователя (3-50 символов, только буквы, цифры и _)"}), 400

    if not validate_email(email):
        return jsonify({"error": "Неверный email"}), 400

    if not validate_password(password):
        return jsonify({"error": "Неверный пароль (6-128 символов)"}), 400

    # Санитизация
    username = sanitize_text(username)
    email = sanitize_text(email)
    bio = sanitize_text(bio)[:500]

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Пользователь уже существует"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email уже используется"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_pw, email=email, bio=bio)
    if avatar_filename:
        new_user.avatar = avatar_filename

    db.session.add(new_user)
    db.session.commit()

    login_user(new_user)
    return jsonify({"message": "Пользователь успешно зарегистрирован"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    # Валидация входных данных
    if not username or not password:
        return jsonify({"error": "Необходимо указать имя пользователя и пароль"}), 400

    # Санитизация имени пользователя
    username = sanitize_text(username)

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"message": "Вход выполнен успешно"})

    return jsonify({"error": "Неверные учетные данные"}), 401

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

@app.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "bio": current_user.bio,
        "avatar": current_user.avatar,
        "created_at": current_user.created_at.isoformat()
    })

# Посты
@app.route('/posts', methods=['GET'])
def get_posts():
    user_id = request.args.get('user_id', type=int)
    post_type = request.args.get('type', type=str)
    query = Post.query
    
    if user_id:
        query = query.filter_by(user_id=user_id)
    
    if post_type and post_type in ['post', 'question']:
        query = query.filter_by(post_type=post_type)
    
    posts = query.order_by(Post.created_at.desc()).all()
    posts_data = []
    
    for post in posts:
        posts_data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'image': post.image,
            'post_type': post.post_type,
            'likes_count': post.likes_count,
            'dislikes_count': post.dislikes_count,
            'created_at': post.created_at.isoformat(),
            'author': {
                'id': post.author.id,
                'username': post.author.username,
                'avatar': post.author.avatar
            }
        })
    
    return jsonify({"posts": posts_data})

@app.route('/posts', methods=['POST'])
@login_required
def create_post():
    title = request.form.get('title', '').strip()
    content = request.form.get('content', '').strip()
    post_type = request.form.get('post_type', 'post').strip()
    
    # Валидация типа поста
    if post_type not in ['post', 'question']:
        return jsonify({"error": "Неверный тип поста"}), 400
    
    # Валидация содержимого поста
    is_valid, error_msg = validate_post_content(title, content)
    if not is_valid:
        return jsonify({"error": error_msg}), 400
    
    # Санитизация содержимого
    title = sanitize_text(title)
    content = sanitize_text(content)
    
    # Обработка изображения
    image_filename = None
    if 'image' in request.files:
        file = request.files['image']
        if file.filename != '':
            image_filename = save_file(file)
            if not image_filename:
                return jsonify({"error": "Неверный формат изображения"}), 400

    post = Post(title=title, content=content, image=image_filename, user_id=current_user.id, post_type=post_type)
    
    db.session.add(post)
    db.session.commit()
    
    return jsonify({"message": "Пост успешно создан"}), 201

@app.route('/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    if post.user_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Удаляем файл изображения
    if post.image:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], post.image))
        except:
            pass
    
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({"message": "Post deleted"})

# Реакции на посты
@app.route('/posts/<int:post_id>/reaction', methods=['POST'])
@login_required
def add_reaction(post_id):
    data = request.get_json()
    reaction_type = data.get('reaction_type', '').strip()
    
    if reaction_type not in ['like', 'dislike']:
        return jsonify({"error": "Неверный тип реакции"}), 400
    
    post = Post.query.get_or_404(post_id)
    
    # Проверяем, есть ли уже реакция от этого пользователя
    existing_reaction = PostReaction.query.filter_by(
        user_id=current_user.id, 
        post_id=post_id
    ).first()
    
    if existing_reaction:
        if existing_reaction.reaction_type == reaction_type:
            # Убираем реакцию
            if reaction_type == 'like':
                post.likes_count -= 1
            else:
                post.dislikes_count -= 1
            db.session.delete(existing_reaction)
        else:
            # Меняем реакцию
            if existing_reaction.reaction_type == 'like':
                post.likes_count -= 1
                post.dislikes_count += 1
            else:
                post.likes_count += 1
                post.dislikes_count -= 1
            existing_reaction.reaction_type = reaction_type
    else:
        # Добавляем новую реакцию
        new_reaction = PostReaction(
            user_id=current_user.id,
            post_id=post_id,
            reaction_type=reaction_type
        )
        db.session.add(new_reaction)
        
        if reaction_type == 'like':
            post.likes_count += 1
        else:
            post.dislikes_count += 1
    
    db.session.commit()
    
    return jsonify({
        "likes_count": post.likes_count,
        "dislikes_count": post.dislikes_count
    })

# Комментарии
@app.route('/posts/<int:post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = Comment.query.filter_by(post_id=post_id).order_by(Comment.created_at.asc()).all()
    comments_data = []
    
    for comment in comments:
        user = User.query.get(comment.user_id)
        if user:
            comments_data.append({
                'id': comment.id,
                'content': comment.content,
                'created_at': comment.created_at.isoformat(),
                'author': {
                    'id': comment.user_id,
                    'username': user.username,
                    'avatar': user.avatar
                }
            })
    
    return jsonify({"comments": comments_data})

@app.route('/posts/<int:post_id>/comments', methods=['POST'])
@login_required
def add_comment(post_id):
    data = request.get_json()
    content = data.get('content', '').strip()
    
    if not content:
        return jsonify({"error": "Содержимое комментария обязательно"}), 400
    
    if len(content) > 500:
        return jsonify({"error": "Комментарий слишком длинный (максимум 500 символов)"}), 400
    
    # Санитизация
    content = sanitize_text(content)
    
    comment = Comment(content=content, user_id=current_user.id, post_id=post_id)
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        "id": comment.id,
        "content": comment.content,
        "created_at": comment.created_at.isoformat(),
        "author": {
            "id": current_user.id,
            "username": current_user.username,
            "avatar": current_user.avatar
        }
    }), 201

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    
    if comment.user_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    db.session.delete(comment)
    db.session.commit()
    
    return jsonify({"message": "Comment deleted"})

# Теги
@app.route('/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.order_by(Tag.name).all()
    tags_data = []
    
    for tag in tags:
        tags_data.append({
            'id': tag.id,
            'name': tag.name,
            'color': tag.color,
            'posts_count': PostTag.query.filter_by(tag_id=tag.id).count()
        })
    
    return jsonify({"tags": tags_data})

@app.route('/tags', methods=['POST'])
@login_required
def create_tag():
    data = request.get_json()
    name = data.get('name', '').strip()
    color = data.get('color', '#3B82F6')
    
    if not name or len(name) > 50:
        return jsonify({"error": "Название тега обязательно и не более 50 символов"}), 400
    
    if Tag.query.filter_by(name=name).first():
        return jsonify({"error": "Тег уже существует"}), 400
    
    tag = Tag(name=name, color=color)
    db.session.add(tag)
    db.session.commit()
    
    return jsonify({
        "id": tag.id,
        "name": tag.name,
        "color": tag.color
    }), 201

# Закладки
@app.route('/posts/<int:post_id>/bookmark', methods=['POST'])
@login_required
def toggle_bookmark(post_id):
    existing_bookmark = Bookmark.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    
    if existing_bookmark:
        db.session.delete(existing_bookmark)
        db.session.commit()
        return jsonify({"bookmarked": False})
    else:
        bookmark = Bookmark(user_id=current_user.id, post_id=post_id)
        db.session.add(bookmark)
        db.session.commit()
        return jsonify({"bookmarked": True})

@app.route('/bookmarks', methods=['GET'])
@login_required
def get_bookmarks():
    bookmarks = Bookmark.query.filter_by(user_id=current_user.id).order_by(Bookmark.created_at.desc()).all()
    posts_data = []
    
    for bookmark in bookmarks:
        post = Post.query.get(bookmark.post_id)
        if post:
            posts_data.append({
                'id': post.id,
                'title': post.title,
                'content': post.content,
                'image': post.image,
                'post_type': post.post_type,
                'likes_count': post.likes_count,
                'dislikes_count': post.dislikes_count,
                'created_at': post.created_at.isoformat(),
                'author': {
                    'id': post.author.id,
                    'username': post.author.username,
                    'avatar': post.author.avatar
                }
            })
    
    return jsonify({"posts": posts_data})

# Уведомления
@app.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).limit(50).all()
    notifications_data = []
    
    for notification in notifications:
        notifications_data.append({
            'id': notification.id,
            'type': notification.type,
            'title': notification.title,
            'message': notification.message,
            'is_read': notification.is_read,
            'related_post_id': notification.related_post_id,
            'created_at': notification.created_at.isoformat()
        })
    
    return jsonify({"notifications": notifications_data})

@app.route('/notifications/<int:notification_id>/read', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user.id).first()
    if notification:
        notification.is_read = True
        db.session.commit()
        return jsonify({"message": "Notification marked as read"})
    return jsonify({"error": "Notification not found"}), 404

@app.route('/notifications/read-all', methods=['POST'])
@login_required
def mark_all_notifications_read():
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"})

# Достижения
@app.route('/achievements', methods=['GET'])
def get_achievements():
    achievements = Achievement.query.all()
    achievements_data = []
    
    for achievement in achievements:
        achievements_data.append({
            'id': achievement.id,
            'name': achievement.name,
            'description': achievement.description,
            'icon': achievement.icon,
            'condition_type': achievement.condition_type,
            'condition_value': achievement.condition_value
        })
    
    return jsonify({"achievements": achievements_data})

@app.route('/users/<int:user_id>/achievements', methods=['GET'])
def get_user_achievements(user_id):
    user_achievements = UserAchievement.query.filter_by(user_id=user_id).all()
    achievements_data = []
    
    for user_achievement in user_achievements:
        achievement = Achievement.query.get(user_achievement.achievement_id)
        if achievement:
            achievements_data.append({
                'id': achievement.id,
                'name': achievement.name,
                'description': achievement.description,
                'icon': achievement.icon,
                'earned_at': user_achievement.earned_at.isoformat()
            })
    
    return jsonify({"achievements": achievements_data})

# Экспорт постов
@app.route('/posts/<int:post_id>/export', methods=['GET'])
def export_post(post_id):
    post = Post.query.get_or_404(post_id)
    
    # Создаем HTML для экспорта
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{post.title}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            .header {{ border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }}
            .author {{ color: #666; font-size: 14px; }}
            .content {{ line-height: 1.6; }}
            .image {{ max-width: 100%; height: auto; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{post.title}</h1>
            <div class="author">
                Автор: {post.author.username} | 
                Дата: {post.created_at.strftime('%d.%m.%Y %H:%M')} | 
                Тип: {post.post_type}
            </div>
        </div>
        <div class="content">
            {post.content.replace(chr(10), '<br>')}
        </div>
        {f'<img src="data:image/jpeg;base64,{post.image}" class="image" alt="Изображение">' if post.image else ''}
    </body>
    </html>
    """
    
    from flask import Response
    return Response(html_content, mimetype='text/html', headers={'Content-Disposition': f'attachment; filename=post_{post_id}.html'})

# Чат
@app.route('/chat/rooms', methods=['GET'])
@login_required
def get_chat_rooms():
    """Получаем все чат-комнаты пользователя"""
    # Находим все комнаты, где участвует текущий пользователь
    rooms = ChatRoom.query.filter(
        db.or_(
            ChatRoom.user1_id == current_user.id,
            ChatRoom.user2_id == current_user.id
        )
    ).order_by(ChatRoom.last_message_at.desc()).all()
    
    rooms_data = []
    for room in rooms:
        # Определяем собеседника
        other_user_id = room.user1_id if room.user1_id != current_user.id else room.user2_id
        other_user = User.query.get(other_user_id)
        
        if other_user:
            # Получаем последнее сообщение
            last_message = ChatMessage.query.filter(
                db.or_(
                    db.and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == other_user_id),
                    db.and_(ChatMessage.sender_id == other_user_id, ChatMessage.receiver_id == current_user.id)
                )
            ).order_by(ChatMessage.created_at.desc()).first()
            
            # Считаем непрочитанные сообщения
            unread_count = ChatMessage.query.filter_by(
                sender_id=other_user_id,
                receiver_id=current_user.id,
                is_read=False
            ).count()
            
            rooms_data.append({
                'room_id': room.id,
                'other_user': {
                    'id': other_user.id,
                    'username': other_user.username,
                    'avatar': other_user.avatar
                },
                'last_message': {
                    'content': last_message.content if last_message else '',
                    'created_at': last_message.created_at.isoformat() if last_message else room.last_message_at.isoformat(),
                    'is_from_me': last_message.sender_id == current_user.id if last_message else False
                },
                'unread_count': unread_count
            })
    
    return jsonify({"rooms": rooms_data})

@app.route('/chat/messages/<int:other_user_id>', methods=['GET'])
@login_required
def get_chat_messages(other_user_id):
    """Получаем сообщения с конкретным пользователем"""
    messages = ChatMessage.query.filter(
        db.or_(
            db.and_(ChatMessage.sender_id == current_user.id, ChatMessage.receiver_id == other_user_id),
            db.and_(ChatMessage.sender_id == other_user_id, ChatMessage.receiver_id == current_user.id)
        )
    ).order_by(ChatMessage.created_at.asc()).all()
    
    messages_data = []
    for message in messages:
        messages_data.append({
            'id': message.id,
            'content': message.content,
            'sender_id': message.sender_id,
            'receiver_id': message.receiver_id,
            'is_read': message.is_read,
            'created_at': message.created_at.isoformat()
        })
    
    # Отмечаем сообщения как прочитанные
    ChatMessage.query.filter_by(
        sender_id=other_user_id, 
        receiver_id=current_user.id, 
        is_read=False
    ).update({'is_read': True})
    db.session.commit()
    
    return jsonify({"messages": messages_data})

@app.route('/chat/send', methods=['POST'])
@login_required
def send_message():
    """Отправляем сообщение"""
    data = request.get_json()
    receiver_id = data.get('receiver_id')
    content = data.get('content', '').strip()
    
    if not receiver_id or not content:
        return jsonify({"error": "Получатель и содержимое обязательны"}), 400
    
    if len(content) > 1000:
        return jsonify({"error": "Сообщение слишком длинное (максимум 1000 символов)"}), 400
    
    # Проверяем, что получатель существует
    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({"error": "Пользователь не найден"}), 404
    
    # Санитизация
    content = sanitize_text(content)
    
    # Создаем или находим чат-комнату
    room = ChatRoom.query.filter(
        db.or_(
            db.and_(ChatRoom.user1_id == current_user.id, ChatRoom.user2_id == receiver_id),
            db.and_(ChatRoom.user1_id == receiver_id, ChatRoom.user2_id == current_user.id)
        )
    ).first()
    
    if not room:
        room = ChatRoom(user1_id=current_user.id, user2_id=receiver_id)
        db.session.add(room)
    
    # Создаем сообщение
    message = ChatMessage(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        content=content
    )
    db.session.add(message)
    
    # Обновляем время последнего сообщения в комнате
    room.last_message_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        "id": message.id,
        "content": message.content,
        "sender_id": message.sender_id,
        "receiver_id": message.receiver_id,
        "created_at": message.created_at.isoformat()
    }), 201

@app.route('/chat/unread-count', methods=['GET'])
@login_required
def get_unread_count():
    """Получаем общее количество непрочитанных сообщений"""
    unread_count = ChatMessage.query.filter_by(
        receiver_id=current_user.id,
        is_read=False
    ).count()
    
    return jsonify({"unread_count": unread_count})

# Поиск постов
@app.route('/posts/search', methods=['GET'])
def search_posts():
    query = request.args.get('q', '').strip()
    post_type = request.args.get('type', type=str)
    
    if not query:
        return jsonify({"posts": []})
    
    search_query = Post.query.filter(
        db.or_(
            Post.title.ilike(f'%{query}%'),
            Post.content.ilike(f'%{query}%')
        )
    )
    
    if post_type and post_type in ['post', 'question']:
        search_query = search_query.filter_by(post_type=post_type)
    
    posts = search_query.order_by(Post.created_at.desc()).all()
    posts_data = []
    
    for post in posts:
        posts_data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'image': post.image,
            'post_type': post.post_type,
            'likes_count': post.likes_count,
            'dislikes_count': post.dislikes_count,
            'created_at': post.created_at.isoformat(),
            'author': {
                'id': post.author.id,
                'username': post.author.username,
                'avatar': post.author.avatar
            }
        })
    
    return jsonify({"posts": posts_data})

# Статистика пользователя
@app.route('/users/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    user = User.query.get_or_404(user_id)
    
    posts_count = Post.query.filter_by(user_id=user_id).count()
    questions_count = Post.query.filter_by(user_id=user_id, post_type='question').count()
    total_likes = db.session.query(db.func.sum(Post.likes_count)).filter_by(user_id=user_id).scalar() or 0
    total_dislikes = db.session.query(db.func.sum(Post.dislikes_count)).filter_by(user_id=user_id).scalar() or 0
    comments_count = Comment.query.filter_by(user_id=user_id).count()
    
    return jsonify({
        "posts_count": posts_count,
        "questions_count": questions_count,
        "total_likes": total_likes,
        "total_dislikes": total_dislikes,
        "comments_count": comments_count,
        "reputation": total_likes - total_dislikes
    })

# Профиль
@app.route('/profile/avatar', methods=['POST'])
@login_required
def upload_avatar():
    if 'avatar' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    filename = save_file(file)
    if not filename:
        return jsonify({"error": "Invalid file type"}), 400
    
    # Удаляем старую аватарку
    if current_user.avatar and current_user.avatar != 'default.png':
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], current_user.avatar))
        except:
            pass
    
    current_user.avatar = filename
    db.session.commit()
    
    return jsonify({"message": "Avatar updated", "avatar": filename})

@app.route('/profile/update', methods=['PUT'])
@login_required
def update_profile():
    data = request.get_json()
    username = data.get('username', '').strip()
    current_password = data.get('current_password', '').strip()
    new_password = data.get('new_password', '').strip()
    
    # Проверяем текущий пароль
    if not current_password or not bcrypt.check_password_hash(current_user.password, current_password):
        return jsonify({"error": "Неверный текущий пароль"}), 400
    
    # Обновляем username
    if username and username != current_user.username:
        if not validate_username(username):
            return jsonify({"error": "Неверное имя пользователя"}), 400
        
        username = sanitize_text(username)
        
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Имя пользователя уже занято"}), 400
        
        current_user.username = username
    
    # Обновляем пароль
    if new_password:
        if not validate_password(new_password):
            return jsonify({"error": "Неверный новый пароль (6-128 символов)"}), 400
        
        current_user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
    
    db.session.commit()
    return jsonify({"message": "Профиль обновлен"})

# Файлы
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Публичный профиль пользователя
@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "bio": user.bio,
        "avatar": user.avatar,
        "created_at": user.created_at.isoformat()
    })


def ensure_post_type_column():
    """Добавляем колонку post_type в таблицу post для SQLite."""
    try:
        with db.engine.connect() as conn:
            cols = conn.execute(text("PRAGMA table_info('post')")).fetchall()
            col_names = {c[1] for c in cols}
            if 'post_type' not in col_names:
                conn.execute(text("ALTER TABLE post ADD COLUMN post_type VARCHAR(20) DEFAULT 'post'"))
            if 'likes_count' not in col_names:
                conn.execute(text("ALTER TABLE post ADD COLUMN likes_count INTEGER DEFAULT 0"))
            if 'dislikes_count' not in col_names:
                conn.execute(text("ALTER TABLE post ADD COLUMN dislikes_count INTEGER DEFAULT 0"))
            conn.commit()
    except Exception:
        # Тихо игнорируем, если БД ещё не создана
        pass

def init_achievements():
    """Инициализация достижений"""
    achievements_data = [
        {
            'name': 'Первый пост',
            'description': 'Создайте свой первый пост',
            'icon': '📝',
            'condition_type': 'posts',
            'condition_value': 1
        },
        {
            'name': 'Активный автор',
            'description': 'Создайте 10 постов',
            'icon': '✍️',
            'condition_type': 'posts',
            'condition_value': 10
        },
        {
            'name': 'Популярный автор',
            'description': 'Получите 50 лайков',
            'icon': '⭐',
            'condition_type': 'likes',
            'condition_value': 50
        },
        {
            'name': 'Комментатор',
            'description': 'Оставьте 20 комментариев',
            'icon': '💬',
            'condition_type': 'comments',
            'condition_value': 20
        },
        {
            'name': 'Любознательный',
            'description': 'Задайте 5 вопросов',
            'icon': '❓',
            'condition_type': 'questions',
            'condition_value': 5
        }
    ]
    
    for achievement_data in achievements_data:
        existing = Achievement.query.filter_by(name=achievement_data['name']).first()
        if not existing:
            achievement = Achievement(**achievement_data)
            db.session.add(achievement)
    
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        ensure_post_type_column()
        init_achievements()
    app.run(debug=True, host="localhost", port=5000)
