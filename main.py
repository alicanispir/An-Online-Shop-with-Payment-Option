from flask import Flask, abort, render_template, redirect, url_for, flash, request
from flask_bootstrap import Bootstrap5
from flask_ckeditor import CKEditor
from flask_gravatar import Gravatar
from flask_login import UserMixin, login_user, LoginManager, current_user, logout_user, login_required
from flask_sqlalchemy import SQLAlchemy
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship
from forms import CreatePostForm, RegisterForm, LoginForm, CommentForm
# Optional: add contact me email functionality (Day 60)
# import smtplib
import time
import os
import random
import cgi
import json

from datetime import datetime

import stripe

stripe.api_key = 'YOUR_STRIPE_API_KEY'

YOUR_DOMAIN = 'http://127.0.0.1:5001'

os.environ["FLASK_KEY"] = 'YOUR_FLASK_KEY'
app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("FLASK_KEY")
ckeditor = CKEditor(app)
Bootstrap5(app)

#Configure Flask-login
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.get_or_404(User, user_id)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DB_URI", "sqlite:///posts.db")
db = SQLAlchemy()
db.init_app(app)

class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    name = db.Column(db.String(100))
    cart_items = db.relationship("CartItem", back_populates="user", cascade="all, delete")

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emoji = db.Column(db.String(10), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    user = db.relationship("User", back_populates="cart_items")

with app.app_context():
    db.create_all()

@app.route('/')
def main_page():
    return render_template("index.html", current_user=current_user)

@app.route('/register', methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        result = db.session.execute(db.select(User).where(User.email == form.email.data))
        user = result.scalar()
        if user:
            flash("You've already signed up with that email, log in instead!")
            return redirect(url_for('login'))
        hash_and_salted_password = generate_password_hash(
            form.password.data,
            method='pbkdf2:sha256',
            salt_length=8
        )
        new_user = User(
            email=form.email.data,
            name=form.name.data,
            password=hash_and_salted_password,
        )
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return redirect(url_for("main_page"))
    return render_template("register.html", form=form, current_user=current_user)

@app.route('/login', methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        password = form.password.data
        result = db.session.execute(db.select(User).where(User.email == form.email.data))
        user = result.scalar()
        if not user:
            flash("That email does not exist, please try again.")
            return redirect(url_for('login'))
        elif not check_password_hash(user.password, password):
            flash('Password incorrect, please try again.')
            return redirect(url_for('login'))
        else:
            login_user(user)
            return redirect(url_for('main_page'))
    return render_template("login.html", form=form, current_user=current_user)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main_page'))

@app.route('/add-to-cart', methods=['POST'])
@login_required
def add_to_cart():
    pillow_id = int(request.form.get('pillow_id'))
    pillow = next((item for item in EMOJI_PILLOWS if item["id"] == pillow_id), None)

    if pillow:
        item = CartItem(
            user_id=current_user.id,
            emoji=pillow["emoji"],
            name=pillow["name"],
            price=float(pillow["price"].strip('$'))
        )
        db.session.add(item)
        db.session.commit()
        flash('Item added to cart!', 'success')
    else:
        flash('Pillow not found.', 'danger')

    return redirect(url_for('random_pillows'))

@app.route("/cart")
@login_required
def view_cart():
    items = current_user.cart_items
    total = sum(item.price for item in items)
    return render_template("cart.html", items=items, total=total)

# Dummy emoji pillow data
EMOJI_PILLOWS = [
    {"id": 1, "emoji": "😄", "name": "Smiling Face", "price": "$14"},
    {"id": 2, "emoji": "😂", "name": "Laughing Tears", "price": "$18"},
    {"id": 3, "emoji": "😍", "name": "Heart Eyes", "price": "$25"},
    {"id": 4, "emoji": "😎", "name": "Cool Sunglasses", "price": "$22"},
    {"id": 5, "emoji": "😴", "name": "Sleepy", "price": "$17"},
    {"id": 6, "emoji": "🥳", "name": "Party", "price": "$20"},
    {"id": 7, "emoji": "😢", "name": "Sad", "price": "$13"},
    {"id": 8, "emoji": "😡", "name": "Angry", "price": "$15"},
    {"id": 9, "emoji": "🤩", "name": "Star Eyes", "price": "$26"},
    {"id": 10, "emoji": "💩", "name": "Poop", "price": "$30"},
    {"id": 11, "emoji": "🤗", "name": "Hug", "price": "$19"},
    {"id": 12, "emoji": "🤑", "name": "Money Eyes", "price": "$33"},
    {"id": 13, "emoji": "👻", "name": "Ghost", "price": "$21"},
    {"id": 14, "emoji": "🐱", "name": "Cat", "price": "$24"},
    {"id": 15, "emoji": "🌈", "name": "Rainbow", "price": "$28"},
]

@app.route('/random-pillows')
def random_pillows():
    selected = random.sample(EMOJI_PILLOWS, 10)
    return render_template("random_pillows.html", pillows=selected)

@app.route("/empty-cart", methods=["POST"])
@login_required
def empty_cart():
    CartItem.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    flash("Your cart has been emptied.", "info")
    return redirect(url_for("view_cart"))

@app.route('/create-checkout-session', methods=['POST'])
@login_required
def create_checkout_session():
    items = CartItem.query.filter_by(user_id=current_user.id).all()

    line_items = []
    for item in items:
        line_items.append({
            'price_data': {
                'currency': 'usd',
                'product_data': {
                    'name': f"{item.emoji} {item.name}",
                },
                'unit_amount': int(item.price * 100),
            },
            'quantity': 1,
        })

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url=YOUR_DOMAIN + '/success',
            cancel_url=YOUR_DOMAIN + '/cancel',
        )
        return redirect(checkout_session.url, code=303)
    except Exception as e:
        return str(e)

@app.route('/success')
def success():
    items = CartItem.query.filter_by(user_id=current_user.id).all()
    for item in items:
        db.session.delete(item)
    db.session.commit()
    return render_template('success.html')

@app.route('/cancel')
def cancel():
    return render_template('cancel.html')

if __name__ == "__main__":
    app.run(debug=True, port=5001)
