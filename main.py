from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# json parsing and csv data tools
import pandas as pd
import json



class StudioCrawler: 
    """
    for crawling individual dance studio websites in NYC
    """
    javascript_code = """
    // overwrite the `languages` property to use a custom getter
    Object.defineProperty(navigator, 'languages', {
    get: function() {
        return ['en-US', 'en'];
    },
    });

    // overwrite the `plugins` property to use a custom getter
    Object.defineProperty(navigator, 'plugins', {
    get: function() {
        return [1, 2, 3, 4, 5];
    },
    });
    """
    def __init__(self, studios: {str: str} = None) -> None:
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        options.add_argument("--ignore-certificate-error")
        options.add_argument("--ignore-ssl-errors")
        user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
        options.add_argument(f'user-agent={user_agent}')
        self.driver = webdriver.Chrome(options=options)
        # self.driver.execute_script(self.javascript_code)
        self.studios = studios
        self.data = {name: [] for name, _ in studios.items()}

    def crawlSessions(self):
      for studio_name, url in self.studios.items():
        print(studio_name, url)
        self.driver.get(url)
        
        if studio_name == 'Peri':
           self.peri_handler()
        if studio_name == 'PMT':
           self.pmt_handler()
          
    def peri_handler(self):
      self.driver.implicitly_wait(3)
      try: 
        dates = self.driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
        print(dates)
        # workaround for StaleElementReferenceException: relocate all dates and use a counter instead of iterate through them
        available_dates = len(dates)
        for i in range(1, available_dates):
            dates = self.driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
            dates[i].click()
            try:
                # Wait up to 10 seconds for the page to be loaded
                WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
                WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'bw-widget__sessions')))
            except:
                print("Page did not load in 10 seconds!")
            
            classes = [session.text for session in self.driver.find_elements(By.XPATH, "//div[@class='bw-session']")]
            for session in classes:
              info = session.split('\n')
              # trim off buttons
              info = list(filter(lambda x: x != 'View details' and x != 'Register', info))
              self.data['Peri'].append(info) #TODO: future storage in csv or database
      except Exception as e:
        print(e)

      
    
    def pmt_handler(self):
      self.driver.implicitly_wait(3)
      try: 
        dates = self.driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
        print(dates)
        # workaround for StaleElementReferenceException: relocate all dates and use a counter instead of iterate through them
        available_dates = len(dates)
        for i in range(1, available_dates):
            # relocate all the date buttons to prevent staleelement exception
            dates = self.driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
            dates[i].click()
            try:
                # Wait up to 10 seconds for the page to be loaded
                WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'html')))
                WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'bw-widget__sessions')))
            except:
                print("Page did not load in 10 seconds!")
            
            # try:
            #   self.driver.find_elements(By.XPATH, "//div[@class='bw-session']")
            # except:
            #    print("Some error occured while finding classes")
            classes = [session.text for session in self.driver.find_elements(By.XPATH, "//div[@class='bw-session__info']")]
            for session in classes:
              print('1 class')
              start_time = session.find_element(By.XPATH, "//time[@class='hc_starttime']").get_attribute('datetime')
              end_time = session.find_element(By.XPATH, "//time[@class='hc_endtime']").get_attribute('datetime')
              session_name = session.find_element(By.XPATH, "//div[@class='bw-session__name']").text
              instructor = session.find_element(By.XPATH, "//div[@class='bw-session__staff']").text
              info = {
                'start_time': start_time,
                'end_time': end_time,
                'session_name': session_name,
                'instructor': instructor
              }
              print(info)
              self.data['PMT'].append(info) #TODO: future storage in csv or database
      except Exception as e:
         print(e)



if __name__ == "__main__":
  # read config file for 
  f= open("site_data.json")
  config = json.load(f)
  studio_urls = config['urls']
  crawler = StudioCrawler(studio_urls)
  crawler.crawlSessions()
  studios = {studio: [] for studio, _ in studio_urls.items()}
  print(crawler.data)

