# this is a practice project for learning selenium
# code tutorial courtesy of https://www.byperth.com/2018/04/25/guide-web-scraping-101-what-you-need-to-know-and-how-to-scrape-with-python-selenium-webdriver/

from selenium import webdriver # allow launching browser
from selenium.webdriver.common.by import By # allow search with parameters
from selenium.webdriver.support.ui import WebDriverWait # allow waiting for page to load
from selenium.webdriver.support import expected_conditions as EC # determine whether the web page has loaded
from selenium.common.exceptions import TimeoutException # handling timeout situation 
import pandas as pd

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

# Extracting data
project_df = pd.DataFrame.from_dict(project_list, orient = 'index')

# Manipulate the table
project_df['project_name'] = project_df.index
project_df.columns = ['project_url', 'project_name']
project_df = project_df.reset_index(drop=True)

# inspect the generated dataframe
# print(project_df)

# Export project dataframe to CSV
project_df.to_csv('project_list.csv')


# example parallelization code
# from concurrent.futures import ProcessPoolExecutor
# import concurrent.futures
# def scrape_url(url):
#  new_browser = create_webdriver()
#  new_browser.get(url)
 
#  # Extract required data here
#  # ...
 
#  new_browser.quit()
 
#  return data

# with ProcessPoolExecutor(max_workers=4) as executor:
#  future_results = {executor.submit(scrape_url, url) for url in urlarray}

# results = []
#  for future in concurrent.futures.as_completed(future_results):
#   results.append(future.result())