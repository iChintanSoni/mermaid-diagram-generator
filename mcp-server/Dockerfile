# Use an official Python runtime as a base image
FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /app

# Install Node.js and npm using the system package manager (Debian-based)
RUN apt-get update && apt-get install -y \
    curl \
    nodejs \
    npm \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# (Optional) Check installations
RUN python3 --version
RUN node --version
RUN npm --version

# Copy the Python application code into the container
COPY ./requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port your Python or Node app runs on (e.g., 5000 for Python Flask)
EXPOSE 5000

# Define the command to run your application (Python primary example)
CMD ["python3", "your_python_script.py"]
