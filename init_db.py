from app import db, app, User
with app.app_context():
    db.drop_all()
    db.create_all()
    print("success")
