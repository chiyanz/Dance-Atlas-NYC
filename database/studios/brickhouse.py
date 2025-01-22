from studios.base_studio_handler import BaseStudioHandler
from zoneinfo import ZoneInfo
from selenium.webdriver.common.by import By
from datetime import datetime

"""
Brickhouse crawler
- blockers:
none

- class listing structure:
all classes for the next week are displayed on a single page, no navigation is needed
"""


class BrickhouseCrawler(BaseStudioHandler):
    def __init__(self, driver, url):
        super().__init__(driver, url)

    def crawl(self):
        self.visit_url()
        
        dates = self.wait_for_all_visible("//div[contains(@class, 'bw-widget__day')]")
        edt_timezone = ZoneInfo("America/New_York")

        available_dates = len(dates)
        for i in range(available_dates):
            day = dates[i]
            try:
                sessions = day.find_elements(
                    By.XPATH, ".//div[contains(@class, 'bw-session__info')]"
                )
                for session in sessions:
                    try:
                        session_starttime = session.find_element(
                            By.XPATH, ".//time[contains(@class, 'hc_starttime')]"
                        ).get_attribute("datetime")
                        session_endtime = session.find_element(
                            By.XPATH, ".//time[contains(@class, 'hc_endtime')]"
                        ).get_attribute("datetime")
                        session_starttime = datetime.fromisoformat(
                            session_starttime
                        ).replace(tzinfo=edt_timezone)
                        session_endtime = datetime.fromisoformat(
                            session_endtime
                        ).replace(tzinfo=edt_timezone)

                        session_name = session.find_element(
                            By.XPATH, ".//div[contains(@class, 'bw-session__name')]"
                        ).text
                        session_level = session.find_element(
                            By.XPATH,
                            ".//div[contains(@class, 'bw-session__level')]",
                        ).text
                        session_staff = session.find_element(
                            By.XPATH,
                            ".//div[contains(@class, 'bw-session__staff')]",
                        ).text
                        session_location = session.find_element(
                            By.XPATH,
                            ".//div[contains(@class, 'bw-session__location')]",
                        ).text
                        url = self.driver.current_url

                        info = {
                            "start_time": session_starttime,
                            "end_time": session_endtime,
                            "session_name": session_name,
                            "level": session_level,
                            "instructor": session_staff,
                            "location": session_location,
                            "url": url,
                        }
                        self.data.append(info)
                    except Exception as e:
                        print(f"Error processing session: {e}")
            except Exception as e:
                print(f"errored parsing day {i}: {e}")
