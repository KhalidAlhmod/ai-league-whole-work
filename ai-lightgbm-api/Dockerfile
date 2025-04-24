# Use Python 3.11 base image
FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Copy all project files into the container
COPY . .

# Install dependencies efficiently
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port Cloud Run expects
EXPOSE 8080

# Start the Flask app using gunicorn on port 8080
CMD ["gunicorn", "--bind", ":8080", "main:app"]
