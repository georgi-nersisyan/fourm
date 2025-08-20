<<<<<<< HEAD
from flask import Flask, request, jsonify
=======
from flask import Flask, request, jsonify, send_from_directory
>>>>>>> c80ee0c (add-posts)
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
<<<<<<< HEAD

# Инициализация приложения
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SECRET_KEY'] = 'secret123'

# Расширения
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
CORS(app, supports_credentials=True)

# Модель пользователя
=======
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
import re
import html

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///simple_forum.db'
app.config['SECRET_KEY'] = 'secret123'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

# Создаем папку для загрузок
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

# CORS
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# === МОДЕЛИ ===
>>>>>>> c80ee0c (add-posts)
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
<<<<<<< HEAD
=======
    avatar = db.Column(db.String(200), default='default.png')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    posts = db.relationship('Post', backref='author', lazy=True, cascade='all, delete-orphan')
    
    def __init__(self, username=None, password=None):
        self.username = username
        self.password = password

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image = db.Column(db.String(200), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __init__(self, title=None, content=None, image=None, user_id=None):
        self.title = title
        self.content = content
        self.image = image
        self.user_id = user_id

# === HELPER FUNCTIONS ===
def sanitize_text(text):
    """Санитизация пользовательского ввода для защиты от XSS"""
    if not text:
        return ""
    # Удаляем HTML теги и экранируем специальные символы
    text = html.escape(text.strip())
    # Удаляем потенциально опасные символы
    text = re.sub(r'[<>"\'/]', '', text)
    return text

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
        # Дополнительная санитизация имени файла
        filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        return unique_filename
    return None
>>>>>>> c80ee0c (add-posts)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

<<<<<<< HEAD
# Тестовый маршрут
@app.route('/')
def index():
    return jsonify({"message": "Backend is running"})

# Регистрация
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "User already exists"}), 400
=======
@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error": "Unauthorized"}), 401

# === ROUTES ===
@app.route('/')
def index():
    return jsonify({"message": "Simple Forum API"})

# Авторизация
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    # Валидация входных данных
    if not validate_username(username):
        return jsonify({"error": "Неверное имя пользователя (3-50 символов, только буквы, цифры и _)"}), 400

    if not validate_password(password):
        return jsonify({"error": "Неверный пароль (6-128 символов)"}), 400

    # Санитизация имени пользователя
    username = sanitize_text(username)

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Пользователь уже существует"}), 400
>>>>>>> c80ee0c (add-posts)

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

<<<<<<< HEAD
    return jsonify({"message": "User registered successfully"}), 201

# Логин
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
=======
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
>>>>>>> c80ee0c (add-posts)

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
<<<<<<< HEAD
        return jsonify({"message": "Login successful"})
    return jsonify({"error": "Invalid credentials"}), 401

# Проверка текущего пользователя
@app.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({"id": current_user.id, "username": current_user.username})

# Выход
=======
        return jsonify({"message": "Вход выполнен успешно"})

    return jsonify({"error": "Неверные учетные данные"}), 401

>>>>>>> c80ee0c (add-posts)
@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

<<<<<<< HEAD
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # создаём таблицы при первом запуске
    app.run(debug=True)
=======
@app.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({
        "id": current_user.id,
        "username": current_user.username,
        "avatar": current_user.avatar,
        "created_at": current_user.created_at.isoformat()
    })

# Посты
@app.route('/posts', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    posts_data = []
    
    for post in posts:
        posts_data.append({
            'id': post.id,
            'title': post.title,
            'content': post.content,
            'image': post.image,
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

    post = Post(title=title, content=content, image=image_filename, user_id=current_user.id)
    
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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="localhost", port=5000)
>>>>>>> c80ee0c (add-posts)
