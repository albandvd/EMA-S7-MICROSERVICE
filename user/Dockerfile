# Dockerfile for the 'user' microservice
FROM python:3.11-slim
WORKDIR /app
RUN pip install --no-cache-dir poetry
COPY pyproject.toml ./
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi
COPY . .
EXPOSE 3002
CMD ["uvicorn", "src.user.main:app", "--host", "0.0.0.0", "--port", "3002", "--reload"]
