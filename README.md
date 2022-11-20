# Tarend Backend

## Setup DB

```
docker-compose -f 'docker-compose.db.yml'
```

- **pgadmin**
  - port: <http://localhost:5050>
  - username: admin@tarend.app
  - password: admin

- **postgresql**
  - host: host.docker.internal | 0.0.0.0
  - port: 5432
  - username: tarend
  - database: tarend_db
  - password: 123456

### To generate and execute your first migration, run the following command in the terminal

```
npx prisma migrate dev --name "init"
```

### Seed data

```
npx prisma db seed
```