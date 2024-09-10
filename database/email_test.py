# this is meant to be a test for environment setup, replace the require os env variables
# and set test_receiver to your personal email account to test the setup of email sending
from dotenv import load_dotenv
from email.message import EmailMessage
import ssl
import os
import smtplib

load_dotenv()

email_password = os.environ.get("app-password")
email_sender = os.environ.get("app-email")

test_receiver = ''
em = EmailMessage()
em['From'] = email_sender
em['To'] = test_receiver
em['Subject'] = 'this is a test email'
em.set_content('this is test email body')

context = ssl.create_default_context()

with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as smtp:
  smtp.login(email_sender, email_password)
  smtp.sendmail(email_sender, test_receiver, em.as_string())