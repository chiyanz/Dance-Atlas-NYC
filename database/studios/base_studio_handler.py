from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


class BaseStudioHandler:
    def __init__(self, driver):
        self.driver = driver
        self.data = []

    def close_popups(
        self, button_xpath: str = ".//div[contains(@class, 'close')]", timeout=10
    ):
        self.driver.switch_to.parent_frame()
        try:
            close_button = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable((By.XPATH, button_xpath))
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

    def wait_for_all_visible(self, xpath, timeout=20):
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.visibility_of_all_elements_located((By.XPATH, xpath)))

    def wait_for_presence(self, xpath, timeout=20):
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
