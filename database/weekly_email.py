from dotenv import load_dotenv
load_dotenv()
import os
from firestore_util import Firebase
from datetime import datetime
import json 
from email.message import EmailMessage
import ssl
import os
import smtplib

# gmail SMTP setup
email_password = os.environ.get("app-password")
email_sender = os.environ.get("app-email")

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

  # TODO: first handle parsing preferences
  def getCustomizedNews(self):
   # TODO: generate a default list of classes
    user_emails = {} 
    for user in self.users:
      preferences =  user['preferences'] if hasattr(user, 'preferences') else None
      matching_classes = []
      if preferences != None and hasPreferences(preferences): 
          user_emails[user.email] = []
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
                  user_emails[user.emmail].append(matching_classes)
      # TODO: we should draft "default" emails for users with no preferences (and also use it if user had no matches)
    print(user_emails)
    self.user_email_classes = user_emails 
  
  # TODO: create a template for generating news emails given news
  def constructEmail(self, data):
    content = 'Hello from Dance Atlas NYC! \n Here are upcoming class offerings in NYC studios that match your preferences: \n'
    for details in data:
      start_time = details['start_time']
      end_time = details['end_time']
      instructor = details.get('instructor', 'unknown instructor')
      session_name = details.get('session_name', 'unknow dance class')
      url = details.get('url', '')
      location = details.get('location', 'unknown location')

      # Formatting the start and end times to a more readable format
      start_time_str = start_time.strftime('%A, %B %d, %Y at %I:%M %p')
      end_time_str = end_time.strftime('%I:%M %p')

      # Constructing the email text
      email_text = f"""
      Class Name: "{session_name}".
      Instructor: {instructor}
      Date and Time: {start_time_str} to {end_time_str}
      Location: {location}

      View more details or register for additional sessions here: {url}
      """
      content += email_text
    content += '\n\nFor more info on upcoming classes go to: https://dance-atlas-nyc.vercel.app/ \n\n Happy dancing!'
    print(f'content is: {content}')
    return content 
  
  # TODO: send emails to active users
  def sendEmails(self):
    # getCustomizedNews will create personalized content
    # constructEmail will generate the raw content
    # finally send the emails 
    context = ssl.create_default_context()
    try: 
      with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
        smtp.login(email_sender, email_password)
        for user_email, user_classes in self.user_email_classes.items():
          content = self.constructEmail(user_classes)
          em = EmailMessage()
          em['From'] = email_sender
          em['To'] = user_email
          em['Subject'] = '[Dance Atlas NYC] Your Weekly Class Update'
          em.set_content(content)
          smtp.sendmail(email_sender, user_email, em.as_string())
    except Exception:
      print('Error encountered while sending emails')
    return 
  

if __name__ == "__main__":
   classData = ClassDatabase()
   classData.getCustomizedNews()
   classData.sendEmails()
