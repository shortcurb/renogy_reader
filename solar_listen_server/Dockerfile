# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install MariaDB client dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libmariadb3 \
    libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set environment variables (if applicable)
ENV PYTHONUNBUFFERED=1

# Run the Python script by default
CMD ["python", "listen_write.py"]
