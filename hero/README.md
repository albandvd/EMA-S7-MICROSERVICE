# HeroService

## Commande `docker run`

```bash
docker run --name db-hero \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=herodb \
  -p 6500:5432 \
  -d postgres:15-alpine
```
