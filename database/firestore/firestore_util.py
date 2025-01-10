import firebase_admin
from firebase_admin import firestore, credentials
import os


class Firebase:

    def __init__(self) -> None:
        default_authentication_path = "./serviceAccountKey.json"
        self.authentication_path = os.getenv(
            "FIREBASE_CREDENTIAL", default_authentication_path
        )

    def create_firebase_admin(self):
        try:
            cred = credentials.Certificate(self.authentication_path)
            app = firebase_admin.initialize_app(cred)
            db = firestore.client()
            return db
        except Exception as e:
            print("firebase auth err: ", e)
