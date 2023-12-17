from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.wait import WebDriverWait
from bs4 import BeautifulSoup
import re

url = 'https://www.claytoncountyregister.com/news2/apple-inc-stock-underperforms-friday-when-compared-to-competitors/918303/'

options = webdriver.ChromeOptions()
options.add_argument("--headless")  # Delete --headless=new to --headless
options.add_argument("--ignore-certificate-error")
options.add_argument("--ignore-ssl-errors")
user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
options.add_argument(f'user-agent={user_agent}')
driver = webdriver.Chrome(options=options)
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
driver.get(url)
driver.execute_script(javascript_code)

try:
    # Wait up to 10 seconds for the page to be loaded
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'html')))
except:
    print("Page did not load in 10 seconds!")

html = driver.page_source
bs_instance = BeautifulSoup(html, "html.parser")
# print(bs_instance.text)
# main_content = bs_instance.find('div', {'class': 'mg-blog-post-box'})
# images = main_content.findAll('img')
top_image = bs_instance.find('img', {'class': 'wp-post-image'})
articles = bs_instance.findAll('article')
primary_article = articles[0] if articles else None
paragraphs = primary_article.findAll('p') if primary_article else []
formatted_articles = "\n".join([pg.get_text() for pg in paragraphs if not pg.get_text().isupper()])

# print('found image: ', top_image)
print(formatted_articles)