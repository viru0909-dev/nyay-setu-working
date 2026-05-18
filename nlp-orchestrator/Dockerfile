# ⚡ FIX: Use a pre-compiled image containing CUDA and core ML dependencies
FROM pytorch/pytorch:2.2.1-cuda12.1-cudnn8-runtime

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install any system level build requirements if needed (usually skipped now)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install only light remaining packages (fastapi, groq, etc)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source code
COPY . .

# Port for your Python service
EXPOSE 8001

# Secure the container with a non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

CMD ["python", "main.py"]