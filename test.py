# this is a practice project for learning selenium
# code tutorial courtesy of https://www.byperth.com/2018/04/25/guide-web-scraping-101-what-you-need-to-know-and-how-to-scrape-with-python-selenium-webdriver/

from selenium import webdriver # allow launching browser
from selenium.webdriver.common.by import By # allow search with parameters
from selenium.webdriver.support.ui import WebDriverWait # allow waiting for page to load
from selenium.webdriver.support import expected_conditions as EC # determine whether the web page has loaded
from selenium.common.exceptions import TimeoutException # handling timeout situation 

# initialization outdated for newer versions of selenium
# driver_option = webdriver.ChromeOptions()
# driver_option.add_argument(" — incognito")
# chromedriver_path = '/Users/jonat/Downloads/chromedriver_win32'
def create_webdriver():
 return webdriver.Chrome()

# Open the website
browser = create_webdriver()
browser.get("https://github.com/collections/machine-learning")

# extract projects
projects = browser.find_elements("xpath", "//h1[@class='h3 lh-condensed']")
# Extract information for each project
project_list = {}
for proj in projects:
 proj_name = proj.text # Project name
 proj_url = proj.find_elements("xpath", "a")[0].get_attribute('href') # Project URL
 project_list[proj_name] = proj_url

# Close connection
browser.quit()

