FROM python:3.13-slim
WORKDIR /app
RUN pip install --no-cache-dir poetry
COPY pyproject.toml poetry.lock* ./
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi --no-root
COPY . .
EXPOSE 3002
CMD ["uvicorn", "src.user.main:app", "--host", "0.0.0.0", "--port", "3002", "--reload"]
