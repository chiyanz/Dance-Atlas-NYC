from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# json parsing and csv data tools
import pandas as pd
import json
import re


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
        # options.add_argument("--headless") # for production: disable browser display 
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
        self.driver.implicitly_wait(5)
        if studio_name == 'Peri':
           self.peri_handler()
        if studio_name == 'PMT':
           self.pmt_handler()
        if studio_name == 'Modega':
           self.modega_handler()
    
    def find(self, selector):
      # finds an element by its xpath selector
      element = self.driver.find_elements(By.XPATH, selector)
      if element:
          return element
      else:
          return False


    def peri_handler(self):
        dates = []
        try:
          wait = WebDriverWait(self.driver, 10)
          dates = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")))
        except Exception as e:
          print(e)
        # dates = self.driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
        # workaround for StaleElementReferenceException: relocate all dates and use a counter instead of iterate through them
        available_dates = len(dates)

        for i in range(available_dates):
            print(f"attempt to click day {i} button")
            self.driver.implicitly_wait(10)
            try:
              dates[i].click()
            except:
              dates = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")))
              dates[i].click()
            print(f"day {i} clicked")

            try:
              classes = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//div[@class='bw-session']")))
              for session in classes:
                print(session.text)
                start_time = session.find_element(By.XPATH, ".//time[@class='hc_starttime']").get_attribute('datetime')
                end_time = session.find_element(By.XPATH, ".//time[@class='hc_endtime']").get_attribute('datetime')
                session_name = session.find_element(By.XPATH, ".//div[@class='bw-session__name']").text
                instructor = session.find_element(By.XPATH, ".//div[@class='bw-session__staff']").text
                info = {
                  'start_time': start_time,
                  'end_time': end_time,
                  'session_name': session_name,
                  'instructor': instructor
                }
                print(info)
                self.data['Peri'].append(info) #TODO: future storage in csv or database
            except Exception as e:
               print(f'no classes found on day {i}')
      
    # on-hold due to JS injection 
    def pmt_handler(self):
      # self.driver.implicitly_wait(3)
        wait = WebDriverWait(self.driver, 10)
        close_button = wait.until(EC.visibility_of_element_located((By.XPATH, "//div[contains(@class, 'wixui-lightbox__close-button')]")))
        close_button.click()
        dates = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")))
        # dates = self.driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
        # workaround for StaleElementReferenceException: relocate all dates and use a counter instead of iterate through them
        available_dates = len(dates)
      
        for i in range(available_dates):
            print(f"attempt to click day {i} button")
            self.driver.implicitly_wait(10)
            try:
              dates[i].click()
            except:
              dates = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")))
              dates[i].click()
            print(f"day {i} clicked")
            # reloate dates
            #     WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
            #     WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'bw-widget__sessions')))
            # except:
            #     print("Page did not load in 10 seconds!")

            classes = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//div[@class='bw-session']")))
            print(len(classes))
            try:
              for session in classes:
                print(session.text)
                start_time = session.find_element(By.XPATH, ".//time[@class='hc_starttime']").get_attribute('datetime')
                end_time = session.find_element(By.XPATH, ".//time[@class='hc_endtime']").get_attribute('datetime')
                session_name = session.find_element(By.XPATH, ".//div[@class='bw-session__name']").text
                instructor = session.find_element(By.XPATH, ".//div[@class='bw-session__staff']").text
                info = {
                  'start_time': start_time,
                  'end_time': end_time,
                  'session_name': session_name,
                  'instructor': instructor
                }
                print(info)
                self.data['Peri'].append(info) #TODO: future storage in csv or database
            except Exception as e:
              # print(f'no classes found on day {i}')
               print('encountered exception', e)

    def modega_handler(self):
      wait = WebDriverWait(self.driver, 10)
      dates = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//*[contains(@class, 'd-flex') and contains(@class, 'flex-column') and contains(@class, 'week-range__day') and not(contains(@class, 'week-range--disabled'))]")))
      available_dates = len(dates)

      for i in range(available_dates):
          print(f"attempt to click day {i} button")
          self.driver.implicitly_wait(10)
          try:
            dates[i].click()
          except:
            dates = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")))
            dates[i].click()
          print(f"day {i} clicked")
          # reloate dates
          #     WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))
          #     WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'bw-widget__sessions')))
          # except:
          #     print("Page did not load in 10 seconds!")

          
          try:
            classes = wait.until(EC.visibility_of_all_elements_located((By.XPATH, "//div[contains(concat(' ', normalize-space(@class), ' '), ' p-1 ') and contains(concat(' ', normalize-space(@class), ' '), ' card-body ')]")))
            print(len(classes))
            for session in classes:
              start_time = session.find_element(By.XPATH, ".//p[contains(@class, 'dateTimeText') and contains(@class, 'card-text')]").text
              duration = re.match(r"\((\d+\smin)\)", start_time)
              session_name = session.find_element(By.XPATH, ".//div[contains(@class, 'card-title')]").text
              misc_info = session.find_elements(By.XPATH, ".//p[contains(@class, 'card-text')]")
              instructor = misc_info[1].text
              location = misc_info[2].text
              print(instructor)
              info = {
                'start_time': start_time,
                'duration': duration,
                'session_name': session_name,
                'instructor': instructor,
                'location': location
              }
              print(info)
              self.data['Modega'].append(info) #TODO: future storage in csv or database
          except Exception as e:
              print(f'no classes found on day {i}')
              print(e)
      return


if __name__ == "__main__":
  # read config file for 
  f= open("site_data.json")
  config = json.load(f)
  studio_urls = config['urls']
  crawler = StudioCrawler(studio_urls)
  crawler.crawlSessions()
  studios = {studio: [] for studio, _ in studio_urls.items()}
  with open('crawler_results.json', 'w', encoding='utf-8') as f:
    json.dump(studios, f, ensure_ascii=False, indent=4)
  print(crawler.data)

