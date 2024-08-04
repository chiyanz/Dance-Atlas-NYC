# Selenium-Web-Scrapper
Utilize Selenium and Python for web scrapping dance studio websites to compile availability data regarding classes (such as time, name, instructor)

### Compatibility
This build uses chromedriver-win64 ver 120 compatible with Chrome 120.x versions. Update chromdriver installation and system PATH variables for Chromdriver compatibility. 

### WIP Features
- Compile studio specific information to make available for download as a csv
- Automate a generic site crawling algorithm to easily allow for crawling additional sites
- Implement crawling strategy for studio rental availability

### Usage
1. Ensure Python3 and pip are installed
2. Download all required dependencies by running ```pip install -r requirements.txt```
3. Modify `site_data.json` to supplement information such as URLs and studio name
4. This script is currently being modified to more easily support command line development. For local testing, use google cloud `functions-frame` package:
   1. Install using `pip install functions-framework`
   2. Run `functions-framework --target=studio_crawler_entry_point` to expose the crawler on `localhost:8080` by default
   3. Either access `http://localhost:8080/` or use `curl localhost:8080` to trigger the function for testing

### Contribution & Questions
contact: jonathanqyz@gmail.com

