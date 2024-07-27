from flask import Flask, render_template, redirect, url_for, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

users = {}  # Simplicity, using in-memory store for users

class User(UserMixin):
    def __init__(self, username):
        self.id = username

@login_manager.user_loader
def load_user(username):
    return User(username)

@app.route('/')
@login_required
def index():
    return render_template('index.html', username=current_user.id)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        if username not in users:
            users[username] = User(username)
        login_user(users[username])
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@socketio.on('message')
def handle_message(data):
    emit('message', {'username': current_user.id, 'message': data['message']}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app)
