from firestore_util import Firebase
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import json
import os
import re
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import platform


class StudioCrawler:
    def __init__(self, studios, mode: str) -> None:
        options = webdriver.ChromeOptions()
        # due to iframes, we now need the browser for navigating hidden contents
        # options.add_argument('--headless=new')
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--ignore-certificate-errors")
        options.add_argument("--ignore-ssl-errors")
        options.add_argument("--ssl-protocol=any")
        user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
        options.add_argument(f"user-agent={user_agent}")
        driver_path = ChromeDriverManager().install()
        driver = webdriver.Chrome(service=Service(driver_path), options=options)
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=options
        )
        self.driver = driver
        self.studios = studios
        self.data = {name: [] for name, _ in studios.items()}
        self.db = Firebase().create_firebase_admin()
        self.mode = mode

    def main(self):
        def custom_serializer(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()  # Convert datetime to ISO format string
            raise TypeError(f"Type {type(obj)} not serializable")

        self.crawlSessions()

        if self.mode == "prod":
            self.storeData()
        else:
            devOutputFile = "dev_output.json"
            try:
                with open(devOutputFile, "w") as f:
                    json.dump(self.data, f, default=custom_serializer)
                    print(f"dev outputs written to: {devOutputFile}")
            except Exception as e:
                print(f"error saving dev outputs: {e}")

    def crawlSessions(self):
        for studio_name, url in self.studios.items():
            print(studio_name, url)
            self.driver.get(url)
            if studio_name == "Peri":
                self.peri_handler()
            if studio_name == "PMT":
                self.pmt_handler()
            if studio_name == "Modega":
                self.modega_handler()
            if studio_name == "BDC":
                self.bdc_handler()
            if studio_name == "Brickhouse":
                self.brickhouse_handler()
            if studio_name == "ILoveDanceManhattan":
                self.ildm_handler()

    def storeData(self):
        for studio, classes in self.data.items():
            studio_ref = self.db.collection("classes").document(studio)
            print(f"storing for {studio}")
            for c in classes:
                try:
                    date = c["start_time"].strftime("%Y-%m-%d")
                    # create composite key from datetime and session name
                    id = date + re.sub(r"[^\w]", "_", c["session_name"])
                    studio_ref.collection(date).document(id).set(c)
                except Exception as e:
                    print(e)
                    print("error parsing stored data")

    def popup_recovery(self, button_xpath: str = ".//div[contains(@class, 'close')]"):
        self.driver.switch_to.parent_frame()
        try:
            close_button = WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.XPATH, button_xpath))
            )
            print("Popup element found. Attempting to close.")
            close_button.click()
            print("Popup closed successfully.")
            return True
        except TimeoutException:
            print("Popup did not appear.")
        except Exception as e:
            print(f"An unexpected error occurred while handling the popup: {e}")
        return False

    def peri_handler(self):
        wait = WebDriverWait(self.driver, 20)
        iframe = wait.until(EC.presence_of_element_located((By.XPATH, "//iframe")))
        self.driver.switch_to.frame(iframe)
        try:
            dates = wait.until(
                EC.visibility_of_all_elements_located(
                    (
                        By.XPATH,
                        "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                    )
                )
            )
        except Exception as e:
            self.popup_recovery(
                ".//div[contains(@class, 'wixui-lightbox__close-button')]"
            )
            iframe = wait.until(EC.presence_of_element_located((By.XPATH, "//iframe")))
            self.driver.switch_to.frame(iframe)
            dates = wait.until(
                EC.visibility_of_all_elements_located(
                    (
                        By.XPATH,
                        "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                    )
                )
            )

        available_dates = len(dates)
        for i in range(available_dates):
            self.driver.implicitly_wait(10)
            try:
                dates[i].click()
            except:
                recovery_result = self.popup_recovery(
                    ".//div[contains(@class, 'wixui-lightbox__close-button')]"
                )
                iframe = wait.until(
                    EC.presence_of_element_located((By.XPATH, "//iframe"))
                )
                self.driver.switch_to.frame(iframe)
                try:
                    dates = wait.until(
                        EC.visibility_of_all_elements_located(
                            (
                                By.XPATH,
                                "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                            )
                        )
                    )
                    dates[i].click()
                except Exception as e:
                    if recovery_result:
                        print(f"Failed after successful popup recovery with: {e}")
                    else:
                        print(f"Failed to close popup after receiving error: {e}")

            try:
                classes = wait.until(
                    EC.visibility_of_all_elements_located(
                        (By.XPATH, "//div[@class='bw-session']")
                    )
                )
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
                    self.data["Peri"].append(info)
            except Exception as e:
                print(f"no classes found on day {i}")

    # on-hold due to JS injection
    def pmt_handler(self):
        # self.driver.implicitly_wait(3)
        wait = WebDriverWait(self.driver, 10)
        close_button = wait.until(
            EC.visibility_of_element_located(
                (
                    By.XPATH,
                    "//div[contains(@class, 'wixui-lightbox__close-button')]",
                )
            )
        )
        close_button.click()
        dates = wait.until(
            EC.visibility_of_all_elements_located(
                (
                    By.XPATH,
                    "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                )
            )
        )
        # dates = self.driver.find_elements(By.XPATH, "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]")
        # workaround for StaleElementReferenceException: relocate all dates and use a counter instead of iterate through them
        available_dates = len(dates)

        for i in range(available_dates):
            print(f"attempt to click day {i} button")
            self.driver.implicitly_wait(10)
            try:
                dates[i].click()
            except:
                dates = wait.until(
                    EC.visibility_of_all_elements_located(
                        (
                            By.XPATH,
                            "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                        )
                    )
                )
                dates[i].click()
            print(f"day {i} clicked")

            classes = wait.until(
                EC.visibility_of_all_elements_located(
                    (By.XPATH, "//div[@class='bw-session']")
                )
            )
            try:
                for session in classes:
                    start_time = session.find_element(
                        By.XPATH, ".//time[@class='hc_starttime']"
                    ).get_attribute("datetime")
                    end_time = session.find_element(
                        By.XPATH, ".//time[@class='hc_endtime']"
                    ).get_attribute("datetime")
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
                    self.data["PMT"].append(info)
            except Exception as e:
                print("encountered exception", e)

    # TODO: add more navigation logic to also read next week
    def modega_handler(self):
        wait = WebDriverWait(self.driver, 20)
        dates = wait.until(
            EC.visibility_of_all_elements_located(
                (
                    By.XPATH,
                    "//*[contains(@class, 'd-flex') and contains(@class, 'flex-column') and contains(@class, 'week-range__day') and not(contains(@class, 'week-range--disabled'))]",
                )
            )
        )
        available_dates = len(dates)

        for i in range(available_dates):
            self.driver.implicitly_wait(10)
            try:
                dates[i].click()
            except:
                dates = wait.until(
                    EC.visibility_of_all_elements_located(
                        (
                            By.XPATH,
                            "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                        )
                    )
                )
                dates[i].click()
            print(f"day {i} clicked")

            try:
                classes = wait.until(
                    EC.visibility_of_all_elements_located(
                        (
                            By.XPATH,
                            "//div[contains(concat(' ', normalize-space(@class), ' '), ' p-1 ') and contains(concat(' ', normalize-space(@class), ' '), ' card-body ')]",
                        )
                    )
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
                    self.data["Modega"].append(info)
            except Exception as e:
                print(f"error getting classes for day {i}")
                print(e)
        return

    def bdc_handler(self):
        wait = WebDriverWait(self.driver, 20)
        dates = wait.until(
            EC.visibility_of_all_elements_located(
                (By.XPATH, "//div[contains(@class, 'bw-widget__day')]")
            )
        )
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
                        self.data["BDC"].append(info)
                    except Exception as e:
                        print(f"Error processing session: {e}")
            except Exception as e:
                print(f"Error processing day: {e}")
        return

    def brickhouse_handler(self):
        wait = WebDriverWait(self.driver, 20)
        dates = wait.until(
            EC.visibility_of_all_elements_located(
                (By.XPATH, "//div[contains(@class, 'bw-widget__day')]")
            )
        )
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
                        self.data["Brickhouse"].append(info)
                    except Exception as e:
                        print(f"Error processing session: {e}")
            except Exception as e:
                print(f"Error processing day: {e}")
        return

    # TODO: try to work around the JS shawdow dom/JS injection / whatever
    def ildm_handler(self):
        wait = WebDriverWait(self.driver, 20)
        dates = []
        try:
            close_button = wait.until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//a[@class='sqs-popup-overlay-close']")
                )
            )
            close_button.click()
            print("Popup closed")
        except Exception as e:
            print("No popup to close")

        dates = wait.until(
            EC.visibility_of_all_elements_located(
                (
                    By.XPATH,
                    "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                )
            )
        )
        available_dates = len(dates)
        print(available_dates)
        for i in range(available_dates):
            self.driver.implicitly_wait(10)
            try:
                dates[i].click()
            except:
                dates = wait.until(
                    EC.visibility_of_all_elements_located(
                        (
                            By.XPATH,
                            "//td[contains(@class, 'bw-calendar__day') and not(contains(@class, 'bw-calendar__day--past'))]",
                        )
                    )
                )
                dates[i].click()
            print(f"day {i} clicked")

            try:
                classes = wait.until(
                    EC.visibility_of_all_elements_located(
                        (By.XPATH, "//div[@class='bw-session']")
                    )
                )
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
                print(f"no classes found on day {i}")
        return


def studio_crawler(request, mode="dev"):

    f = open("site_data.json")
    config = json.load(f)
    studio_urls = config["urls"]
    crawler = StudioCrawler(studio_urls, mode)
    crawler.main()


if __name__ == "__main__":
    studio_crawler(None, "prod")
