import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError

DATABASE_URL = "mysql+pymysql://root:password@user-db:3306/user_db"

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def wait_for_db(engine):
    retries = 30  # On essaie pendant 30 fois
    while retries > 0:
        try:
            # On tente une simple connexion pour voir si la DB répond
            with engine.connect() as connection:
                print("✅ Base de données prête !")
                return
        except OperationalError:
            print(f"⏳ La base de données n'est pas encore prête. ({retries} essais restants...)")
            retries -= 1
            time.sleep(2)  # On attend 2 secondes avant de réessayer
    raise Exception("Impossible de se connecter à la base de données après plusieurs tentatives.")

wait_for_db(engine)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()