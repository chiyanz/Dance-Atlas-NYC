from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait

# json parsing and csv data tools
import pandas as pd
import json

# ignore unneccesary SSL warnings 
options = webdriver.ChromeOptions()
options.add_experimental_option('excludeSwitches', ['enable-logging'])
# driver = webdriver.Chrome()


# init driver
driver = webdriver.Chrome( 
    options=options
)

# read config file for 
f= open("site_data.json")
config = json.load(f)

urls = config['urls']
studios = {studio: [] for studio, _ in urls.items()}

for studio_name, url in urls.items():
  print(studio_name, url)
  driver.get(url)
  if studio_name == 'Peri':
    driver.implicitly_wait(3) # implicait waiting to allow site content to load
    dates = driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
    # workaround for StaleElementReferenceException: relocate all dates and use a counter instead of iterate through them
    available_dates = len(dates)
    for i in range(1, available_dates):
        dates = driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
        dates[i].click()
        driver.implicitly_wait(5) 
        # relocate all date buttons after page refresh
        classes = driver.find_elements(By.XPATH, "//div[@class='bw-session']")
        for session in classes:
          info = session.text.split('\n')
          # trim off "view details"
          if info[-1] == 'View details':
             info = info[:-1]
          studios[studio_name].append(info)
          print(info)
print(studios['Peri'])