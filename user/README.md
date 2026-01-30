# User Service 

```sh
poetry install
poetry run uvicorn src.user.main:app --port 3002 --reload
```

Launch api on http://127.0.0.1:3002/

DB - mysql

``` sh
docker run \
  --name user-mysql \
  -e MYSQL_ROOT_PASSWORD=mot_de_passe \
  -e MYSQL_DATABASE=test_db \
  -p 3306:3306 \
  -d mysql:oraclelinux9
user-mysql
```