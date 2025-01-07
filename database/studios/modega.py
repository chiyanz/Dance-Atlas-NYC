from database.studios.base_studio_handler import BaseStudioHandler
from zoneinfo import ZoneInfo
from database.studios.base_studio_handler import BaseStudioHandler
from selenium.webdriver.common.by import By
from datetime import datetime, timedelta
import re


"""
Moedega crawler
- blockers:
none

- class listing structure:
calendar is displayed for the current week, viewing next week's schedule requries click a right nav button
"""


class PeriDanceCrawler(BaseStudioHandler):
    def __init__(self, driver):
        super().__init__(driver)

    def crawl(self):
        dates = self.wait_for_all_visible(
            "//*[contains(@class, 'd-flex') and contains(@class, 'flex-column') and contains(@class, 'week-range__day') and not(contains(@class, 'week-range--disabled'))]"
        )
        available_dates = len(dates)

        for i in range(available_dates):
            self.driver.implicitly_wait(10)
            try:
                dates[i].click()
            except:
                dates = self.wait_for_all_visible(
                    "//*[contains(@class, 'd-flex') and contains(@class, 'flex-column') and contains(@class, 'week-range__day') and not(contains(@class, 'week-range--disabled'))]"
                )
                dates[i].click()

            try:
                classes = self.wait_for_all_visible(
                    "//div[contains(concat(' ', normalize-space(@class), ' '), ' p-1 ') and contains(concat(' ', normalize-space(@class), ' '), ' card-body ')]"
                )
                for session in classes:
                    class_time = session.find_element(
                        By.XPATH,
                        ".//p[contains(@class, 'dateTimeText') and contains(@class, 'card-text')]",
                    ).text
                    start_time_str = re.search(
                        r"(\d+:\d+\s(?:AM|PM))", class_time
                    ).group(1)
                    start_time = datetime.strptime(start_time_str, "%I:%M %p")
                    today = datetime.now().date()
                    start_time = datetime.combine(
                        today, start_time.timetz()
                    ) + timedelta(days=i)
                    start_time = start_time.replace(tzinfo=ZoneInfo("America/New_York"))
                    match = re.search(r"\((\d+) min\)", class_time)
                    if match:
                        duration = int(match.group(1))
                    else:
                        duration = 0
                    end_time = start_time + timedelta(minutes=duration)

                    session_name = session.find_element(
                        By.XPATH, ".//div[contains(@class, 'card-title')]"
                    ).text
                    misc_info = session.find_elements(
                        By.XPATH, ".//p[contains(@class, 'card-text')]"
                    )
                    instructor = misc_info[1].text
                    location = misc_info[2].text
                    url = self.driver.current_url

                    info = {
                        "start_time": start_time,
                        "end_time": end_time,
                        "session_name": session_name,
                        "instructor": instructor,
                        "location": location,
                        "url": url,
                    }
                    self.data.append(info)
            except Exception as e:
                print(f"errored parsing day {i}: {e}")
