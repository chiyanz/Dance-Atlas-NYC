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
4. Run `main.py` for a pandas Dataframe to be generated and compiled class info to be written to terminal

### Contribution & Questions
contact: jonathanqyz@gmail.com

