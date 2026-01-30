from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .model import User
from .schema import UserCreate

app = FastAPI(title="User Service")

Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    user_obj = User(name=user.name, email=user.email, password=user.password)
    db.add(user_obj)
    db.commit()
    db.refresh(user_obj)
    return user_obj

@app.get("/users/{user_id}")
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
