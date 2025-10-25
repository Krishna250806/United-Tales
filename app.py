from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///story_collab.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Context processor to make user data available globally
@app.context_processor
def inject_user():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        return dict(user=user)
    return dict(user=None)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    writing_strength = db.Column(db.String(50))  # start, end, plot, twist
    favorite_genre = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Story(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    genre = db.Column(db.String(50))
    status = db.Column(db.String(20), default='active')  # active, completed, archived
    author_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    author = db.relationship('User', backref=db.backref('stories', lazy=True))
    contributions = db.relationship('Contribution', backref='story', lazy=True, cascade='all, delete-orphan')

class Contribution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    contributor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    story_id = db.Column(db.Integer, db.ForeignKey('story.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    contributor = db.relationship('User', backref=db.backref('contributions', lazy=True))

# Routes
@app.route('/')
def index():
    stories = Story.query.filter_by(status='active').order_by(Story.updated_at.desc()).limit(6).all()
    return render_template('index.html', stories=stories)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists')
            return redirect(url_for('register'))
        
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        return redirect(url_for('user_preferences'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('index'))

@app.route('/user-preferences', methods=['GET', 'POST'])
def user_preferences():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    
    if request.method == 'POST':
        user.writing_strength = request.form['writing_strength']
        user.favorite_genre = request.form['favorite_genre']
        db.session.commit()
        return redirect(url_for('dashboard'))
    
    return render_template('user_preferences.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    my_stories = Story.query.filter_by(author_id=user.id).order_by(Story.updated_at.desc()).all()
    my_contributions = Contribution.query.filter_by(contributor_id=user.id).order_by(Contribution.created_at.desc()).all()
    pending_approvals = Contribution.query.join(Story).filter(
        Story.author_id == user.id,
        Contribution.status == 'pending'
    ).all()
    
    return render_template('dashboard.html', 
                         user=user, 
                         my_stories=my_stories, 
                         my_contributions=my_contributions,
                         pending_approvals=pending_approvals)

@app.route('/create-story', methods=['GET', 'POST'])
def create_story():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        story = Story(
            title=request.form['title'],
            content=request.form['content'],
            genre=request.form['genre'],
            author_id=session['user_id']
        )
        db.session.add(story)
        db.session.commit()
        return redirect(url_for('story_detail', story_id=story.id))
    
    return render_template('create_story.html')

@app.route('/story/<int:story_id>')
def story_detail(story_id):
    story = Story.query.get_or_404(story_id)
    contributions = Contribution.query.filter_by(story_id=story_id, status='approved').order_by(Contribution.created_at.asc()).all()
    pending_contributions = Contribution.query.filter_by(story_id=story_id, status='pending').all()
    
    return render_template('story_detail.html', 
                         story=story, 
                         contributions=contributions,
                         pending_contributions=pending_contributions)

@app.route('/contribute', methods=['POST'])
def contribute():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    story_id = request.form['story_id']
    content = request.form['content']
    
    contribution = Contribution(
        content=content,
        contributor_id=session['user_id'],
        story_id=story_id
    )
    db.session.add(contribution)
    db.session.commit()
    
    flash('Your contribution has been submitted for approval!')
    return redirect(url_for('story_detail', story_id=story_id))

@app.route('/approve-contribution/<int:contribution_id>')
def approve_contribution(contribution_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    contribution = Contribution.query.get_or_404(contribution_id)
    story = Story.query.get(contribution.story_id)
    
    if story.author_id != session['user_id']:
        flash('You are not authorized to approve this contribution')
        return redirect(url_for('dashboard'))
    
    contribution.status = 'approved'
    story.content += '\n\n' + contribution.content
    story.updated_at = datetime.utcnow()
    db.session.commit()
    
    flash('Contribution approved and added to story!')
    return redirect(url_for('story_detail', story_id=story.id))

@app.route('/reject-contribution/<int:contribution_id>')
def reject_contribution(contribution_id):
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    contribution = Contribution.query.get_or_404(contribution_id)
    story = Story.query.get(contribution.story_id)
    
    if story.author_id != session['user_id']:
        flash('You are not authorized to reject this contribution')
        return redirect(url_for('dashboard'))
    
    contribution.status = 'rejected'
    db.session.commit()
    
    flash('Contribution rejected')
    return redirect(url_for('story_detail', story_id=story.id))

@app.route('/admin')
def admin_panel():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    if not user.is_admin:
        flash('Access denied. Admin privileges required.')
        return redirect(url_for('dashboard'))
    
    users = User.query.all()
    stories = Story.query.all()
    contributions = Contribution.query.all()
    
    return render_template('admin.html', users=users, stories=stories, contributions=contributions)

@app.route('/browse')
def browse_stories():
    genre = request.args.get('genre', '')
    search = request.args.get('search', '')
    
    query = Story.query.filter_by(status='active')
    
    if genre:
        query = query.filter(Story.genre == genre)
    if search:
        query = query.filter(Story.title.contains(search) | Story.content.contains(search))
    
    stories = query.order_by(Story.updated_at.desc()).all()
    genres = db.session.query(Story.genre).distinct().all()
    genres = [g[0] for g in genres if g[0]]
    
    return render_template('browse.html', stories=stories, genres=genres, selected_genre=genre, search_term=search)

@app.route('/delete-story/<int:story_id>')
def delete_story(story_id):
    if 'user_id' not in session:
        flash('You must be logged in to delete stories')
        return redirect(url_for('login'))
    
    story = Story.query.get_or_404(story_id)
    user = User.query.get(session['user_id'])
    
    # Check if user is admin or story owner
    if not user.is_admin and story.author_id != user.id:
        flash('You are not authorized to delete this story')
        return redirect(url_for('dashboard'))
    
    # Delete the story (contributions will be deleted automatically due to cascade)
    story_title = story.title
    db.session.delete(story)
    db.session.commit()
    
    flash(f'Story "{story_title}" deleted successfully!')
    return redirect(url_for('dashboard'))

@app.route('/archive-story/<int:story_id>')
def archive_story(story_id):
    if 'user_id' not in session:
        flash('You must be logged in to archive stories')
        return redirect(url_for('login'))
    
    story = Story.query.get_or_404(story_id)
    user = User.query.get(session['user_id'])
    
    # Check if user is admin or story owner
    if not user.is_admin and story.author_id != user.id:
        flash('You are not authorized to archive this story')
        return redirect(url_for('dashboard'))
    
    # Archive the story instead of deleting
    story.status = 'archived'
    db.session.commit()
    
    flash(f'Story "{story.title}" archived successfully!')
    return redirect(url_for('dashboard'))

@app.route('/make-admin/<username>')
def make_admin(username):
    """Quick route to make a user admin - for development only"""
    user = User.query.filter_by(username=username).first()
    if user:
        user.is_admin = True
        db.session.commit()
        flash(f'User {username} is now an admin!')
    else:
        flash(f'User {username} not found!')
    return redirect(url_for('index'))

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
