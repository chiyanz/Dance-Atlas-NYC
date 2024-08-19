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
import json 

# helper functions
def hasPreferences(obj) -> bool: 
  if len(obj.items()) == 0:
    return False 
  for _, val in obj.items:
    if len(val) > 0:
      return True 
  return False

def get_day_of_week(date_str):
  date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')
  
  day_of_week = date_obj.strftime('%A')
  
  return day_of_week

def filter_classes(classes, preferences):
  filtered_classes = []
  
  level = preferences.get('level', '').lower()
  style = preferences.get('style', '').lower()
  instructor = preferences.get('instructor', '').lower()
  
  for class_obj in classes:
    class_description = class_obj.get('id').lower()
    if class_obj.get('instructor', '').lower() == instructor:
      if level in class_description and style in class_description:
        filtered_classes.append(class_obj)
  
  return filtered_classes

# class_db Class 
# should contain all data
# should include method for matching classes
class ClassDatabase:
  def __init__(self) -> None:
    f = open('site_data.json')
    config = json.load(f)
    studios = config['urls']
    db = Firebase().create_firebase_admin()
    today = datetime.today()
    self.today = today.strftime("%Y %m %d").replace(' ', '-')
    # filter for only relevant classes that are in the future
    # store date in the format of:
    # {
    #   studio: {
    #     date: [classes]}
    # }
    results = { studio: {} for studio, _ in studios.items()}
    try:
      for studio_name, _ in studios.items():
        studio_ref = db.collection('classes').document(studio_name)
        for coll in studio_ref.collections():
          if coll.id >= self.today:
            results[studio_name][coll.id] = []
            for doc in coll.stream():
              results[studio_name][coll.id].append(doc.to_dict())
    except Exception as e:
      # TODO: add better custom error message for class data receival
      raise e
    
    # get a list of all users
    users = []
    try:
      for user_ref in db.collection('users').stream():
        users.append(user_ref.to_dict())
    except Exception as e:
      raise e

    self.data = results 
    self.users = users 
    self.db = db
    print(self.users)

  # TODO: first handle parsing preferences
  def getCustomizedNews(self):
   # TODO: generate a default list of classes
   default_classes = []
   user_emails = {} 
   for user in self.users:
     preferences = user.preferences
     matching_classes = []
     if hasPreferences(preferences): 
        # TODO: improve filtering behavior
        for studio, dates in self.data.items(): 
          if preferences.studio and studio not in preferences.studio:
            continue 
          else: 
            for date, classes in dates.items():
              day = get_day_of_week(date)
              if preferences.dayOfWeek and day not in preferences.dayOfWeek:
                continue 
              else: 
                matching_classes = filter_classes(preferences, classes)
                user_emails[user.email] = filter_classes

     if not len(matching_classes):
       user_emails[user.email] = default_classes 
   self.user_emails = user_emails 
  
  # TODO: create a template for generating news emails given news
  # that a ACTIVE (non-opt-out) user is interested in (or default content)
  def constructEmail(self, data):
    return
  
  # TODO: send emails to active users
  def sendEmails(self):
    # getCustomizedNews will create personalized content
    # constructEmail will generate the raw content
    # finally send the emails 
    return 
  


if __name__ == "__main__":
   classData = ClassDatabase()
