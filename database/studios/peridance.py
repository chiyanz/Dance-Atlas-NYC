from zoneinfo import ZoneInfo
from database.studios.base_studio_handler import BaseStudioHandler
from selenium.webdriver.common.by import By
from datetime import datetime


"""
Peridance crawler
- blockers:
sign-up popup that loads after the page itself loads

- class listing structure:
a monthly calendar is displayed, clicking on a date shows classes only for that day
"""


class PeriDanceCrawler(BaseStudioHandler):
    def __init__(self, driver):
        super().__init__(driver)

    def crawl(self):
        def close_popup_and_switch():
            self.popup_recovery(
                ".//div[contains(@class, 'wixui-lightbox__close-button')]"
            )
            iframe = self.wait_for_presence("//iframe")
            self.driver.switch_to.frame(iframe)

        close_popup_and_switch()
        try:
            dates = self.wait_for_all_visible(
                "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]"
            )
        except:
            close_popup_and_switch()
            dates = self.wait_for_all_visible(
                "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]"
            )

        available_dates = len(dates)
        for i in range(available_dates):
            self.driver.implicitly_wait(10)

            # try accessing the class list for the date
            try:
                dates[i].click()
            except:
                close_popup_and_switch()
                dates = self.wait_for_all_visible(
                    "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]"
                )
                dates[i].click()

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
                    self.data.append(info)
            except Exception as e:
                print(f"errored parsing day {i}: {e}")
