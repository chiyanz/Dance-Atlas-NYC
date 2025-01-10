from firestore.firestore_util import Firebase
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from studios.base_studio_handler import BaseStudioHandler
from studios.peridance import PeriDanceCrawler
from studios.modega import ModegaCrawler
from studios.bdc import BDCCrawler
from studios.brickhouse import BrickhouseCrawler
from studios.ild_manhattan import ILDManhattanCrawler
from selenium import webdriver


import argparse
from typing import Dict, Literal
import json
import re
from datetime import datetime

studio_crawlers = {
    "Peri": PeriDanceCrawler,
    "Modega": ModegaCrawler,
    "BCD": BDCCrawler,
    "Brickhouse": BrickhouseCrawler,
    "ILoveDanceManhattan": ILDManhattanCrawler,
}


studio_urls = {
    "Peri": "https://www.peridance.com/open-classes",
    "Modega": "https://sutrapro.com/modega",
    "BDC": "https://broadwaydancecenter.com/schedule/schedule-in-person",
    "Brickhouse": "https://brickhousedance.com/open-classes/",
    "ILoveDanceManhattan": "https://www.ilovedancenyc.com/instudio-classesmanhattan",
}

studio_mapping: Dict[str, Dict[str, object]] = {
    studio: {"crawler": studio_crawlers[studio], "url": studio_urls[studio]}
    for studio in studio_crawlers.keys() & studio_urls.keys()
}


class StudioCrawler:
    def __init__(self, studios: Dict[str, Dict[str, object]], mode: str) -> None:
        self.studios = studios
        self.mode = mode
        self.driver = self._initialize_driver()
        self.crawlers = self._initialize_crawlers()
        self.db = Firebase().create_firebase_admin()

    def _initialize_driver(self) -> webdriver.Chrome:
        options = webdriver.ChromeOptions()
        # Uncomment the following line if headless mode is required
        # options.add_argument('--headless=new')
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--ignore-certificate-errors")
        options.add_argument("--ignore-ssl-errors")
        user_agent = (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
        )
        options.add_argument(f"user-agent={user_agent}")

        # Use ChromeDriverManager to install and manage the ChromeDriver executable
        driver_path = ChromeDriverManager().install()
        return webdriver.Chrome(service=Service(driver_path), options=options)

    def _initialize_crawlers(self) -> Dict[str, BaseStudioHandler]:
        """
        Initializes and returns a dictionary of crawler instances for each studio.
        """
        return {
            studio_name: studio_data["crawler"](self.driver, studio_data["url"])
            for studio_name, studio_data in self.studios.items()
        }

    def date_serializer(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()  # Convert datetime to ISO format string
        raise TypeError(f"Type {type(obj)} not serializable")

    def main(self):
        self.crawlSessions()

        if self.mode == "prod":
            self.storeData()
        else:
            devOutputFile = "dev_output.json"
            try:
                with open(devOutputFile, "w") as f:
                    json.dump(self.data, f, default=self.date_serializer)
                    print(f"dev outputs written to: {devOutputFile}")
            except Exception as e:
                print(f"error saving dev outputs: {e}")

    def crawlSessions(self):
        for _, crawler in self.crawlers.items():
            crawler.crawl()

    def store(self):
        for studio_name, crawler in self.crawlers.items():
            studio_ref = self.db.collection("classes").document(studio_name)
            print(f"storing for {studio_name}")
            for c in crawler.data:
                try:
                    date = c["start_time"].strftime("%Y-%m-%d")
                    # create composite key from datetime and session name
                    id = date + re.sub(r"[^\w]", "_", c["session_name"])
                    studio_ref.collection(date).document(id).set(c)
                except Exception as e:
                    print(e)
                    print(f"error storing data for studio:  {studio_name}\nentry: {c}")


def parse_arguments() -> Literal["prod", "dev"]:

    parser = argparse.ArgumentParser(description="Run the Studio Crawler script.")
    parser.add_argument(
        "--mode",
        type=str,
        choices=["prod", "dev"],
        default="dev",
        help='Mode to run the crawler. Choose between "prod" and "dev". Defaults to "dev".',
    )
    args = parser.parse_args()
    return args.mode


if __name__ == "__main__":
    mode: Literal["prod", "dev"] = parse_arguments()
    print(f"Running in mode (defaults to dev): {mode}")
    crawler = StudioCrawler(studio_mapping, mode)
    crawler.main()
