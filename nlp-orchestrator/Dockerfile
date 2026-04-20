# Stage 1: Build 
FROM python:3.9-slim AS builder

WORKDIR /app


ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1


RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.9-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

ENV PATH=/root/.local/bin:$PATH


COPY --from=builder /root/.local /root/.local

COPY . .

# Port for the Python service
EXPOSE 5000


# RUN useradd -m appuser && chown -R appuser /app
# USER appuser

CMD ["python", "main.py"]