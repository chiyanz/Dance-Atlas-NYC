# brain-storming
# workflow structure
"""
1 - load all data during and after current day 
2 - load all "active" users 
3 - loop through the user database and narrow search by:
  1 - filtering matching studios 
  2 - filter for day (using day-of-week preference)
  3 - filter for instructor
"""

from firestore_util import Firebase
from datetime import datetime

# class_db Class 
# should contain all data
# should include method for matching classes
class ClassDatabase:
  def __init__(self) -> None:
    db = Firebase().create_firebase_admin()
    self.classes_ref = db.collection('classes')
    today = datetime.today()
    self.today = today.strftime("%Y %m %d")
    self.data = {}
    # filter for only relevant classes that are in the future
    # store date in the format of:
    # {
    #   studio: {
    #     date: [classes]}
    # }
    results = {}
    for studio in self.classes_ref.stream():
      results[studio.id] = {}
      print(studio.id)
      for date_ref in studio.collections():
        if date_ref.id >= self.today:
          results[studio.id][date_ref.id] = []
          for session in date_ref.stream():
            results[studio.id][date_ref.id].append(session.to_dict())
            print(session.to_dict())

    self.data = results 
    self.db = db

    print(self.data)

   
  

if __name__ == "__main__":
   classData = ClassDatabase()
