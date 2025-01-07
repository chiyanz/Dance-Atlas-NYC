from database.studios.base_studio_handler import BaseStudioHandler
from zoneinfo import ZoneInfo
from database.studios.base_studio_handler import BaseStudioHandler
from selenium.webdriver.common.by import By
from datetime import datetime

"""
I Love Dance Manhattan crawler
- blockers:
mailing list popup, loads immediately, can take a couple seconds

- class listing structure:
all classes for the next week are displayed on a single page, no navigation is needed
"""


class ILDManhattanCrawler(BaseStudioHandler):
    def __init__(self, driver):
        super().__init__(driver)

    def crawl(self):
        self.popup_recovery("//a[@class='sqs-popup-overlay-close']")
        try:
            dates = self.wait_for_all_visible(
                "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]"
            )
        except:
            self.popup_recovery("//a[@class='sqs-popup-overlay-close']")
            dates = self.wait_for_all_visible(
                "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]"
            )

        available_dates = len(dates)
        for i in range(available_dates):
            try:
                classes = self.wait_for_all_visible("//div[@class='bw-session']")
                for session in classes:
                    edt_timezone = ZoneInfo("America/New_York")
                    start_time = session.find_element(
                        By.XPATH, ".//time[@class='hc_starttime']"
                    ).get_attribute("datetime")
                    start_time = datetime.fromisoformat(start_time).replace(
                        tzinfo=edt_timezone
                    )
                    end_time = session.find_element(
                        By.XPATH, ".//time[@class='hc_endtime']"
                    ).get_attribute("datetime")
                    end_time = datetime.fromisoformat(end_time).replace(
                        tzinfo=edt_timezone
                    )
                    session_name = session.find_element(
                        By.XPATH, ".//div[@class='bw-session__name']"
                    ).text
                    instructor = session.find_element(
                        By.XPATH, ".//div[@class='bw-session__staff']"
                    ).text
                    url = self.driver.current_url

                    info = {
                        "start_time": start_time,
                        "end_time": end_time,
                        "session_name": session_name,
                        "instructor": instructor,
                        "url": url,
                    }
                    self.data["ILoveDanceManhattan"].append(info)
            except Exception as e:
                print(f"errored parsing day {i}: {e}")
