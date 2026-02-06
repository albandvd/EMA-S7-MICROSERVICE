import jwt

SECRET_KEY = "cle_secret"

def is_authenticated(token: str) -> bool:
    try:
        if not token:
            return False

        jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return True

    except jwt.PyJWTError:
        return False


