```
docker run --name itemdb -p 5432:5432 -e POSTGRES_PASSWORD=itempassword -e POSTGRES_USER=itemuser -e POSTGRES_DB=itemdb -d postgres
```