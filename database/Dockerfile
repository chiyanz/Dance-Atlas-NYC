# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory to /app
WORKDIR /app

# Install necessary tools
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Manually download and install a specific version of Google Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && dpkg -i google-chrome-stable_current_amd64.deb || apt-get install -fy  # Fixes missing dependencies

# Remove the downloaded .deb file to clear space
RUN rm google-chrome-stable_current_amd64.deb

# Manually specify the ChromeDriver version known to be compatible with Chrome 100.0.4896.20
RUN wget -q --continue -P /chromedriver "https://chromedriver.storage.googleapis.com/100.0.4896.60/chromedriver_linux64.zip" \
    && unzip /chromedriver/chromedriver* -d /usr/local/bin/ \
    && rm -rf /chromedriver

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run studio_crawler.py when the container launches
CMD ["python", "./studio_crawler.py"]
