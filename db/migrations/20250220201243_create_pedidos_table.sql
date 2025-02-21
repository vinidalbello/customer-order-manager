-- migrate:up
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    data_pedido DATE NOT NULL,
    valor_total INTEGER NOT NULL,
    itens JSONB NOT NULL CHECK (jsonb_typeof(itens) = 'array' AND jsonb_array_length(itens) > 0),
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_cliente
       FOREIGN KEY (client_id)
       REFERENCES clients(id)
);


-- migrate:down
DROP TABLE pedidos;
