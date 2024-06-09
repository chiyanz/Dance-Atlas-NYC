import firebase_admin
from firebase_admin import firestore, credentials
import os

class Firebase():

  def __init__(self) -> None:
    default_authentication_path = "./credentials/serviceAccountKey.json"
    self.authentication_path = os.getenv("FIREBASE_CREDENTIAL", default_authentication_path)

  def create_firebase_admin(self):
    try:
      cred = credentials.Certificate(self.authentication_path)
      app = firebase_admin.initialize_app(cred)
      db = firestore.client()
      return db
    except Exception as e:
      print('firebase auth err: ', e)
  

if __name__ == "__main__": 
  # TODO
  firebase_instance = Firebase()
  db = firebase_instance.create_firebase_admin()
  doc_ref = db.collection("users").document("test_user")
  doc_ref.set({"first": "Ada", "last": "Lovelace", "born": 1815})








