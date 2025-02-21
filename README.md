# Como rodar esse projeto localmente?

## Requisitos:

### Docker,
### Node,
### Dbmate

### - Instalar o Node e o Docker/Docker Setup,
### - Rodar esse comando para criar um banco de dados PostgreSQL via Docker:
    `
    -- docker run --name temporary-pgdb \
    -e POSTGRES_USER=pgdb \
    -e POSTGRES_PASSWORD=teste123 \
    -e POSTGRES_DB=postgres \
    -p 5432:5432 \
    -d postgres
    `
### - Clonar o projeto
### - Instalar o Dbmate
### - Na raiz do projeto rodar `dbmate up` no terminal
### - `cd project` dentro da raiz do projeto
### - Dentro da pasta /project, rodar `npm install`, e após isso `npm run dev`
