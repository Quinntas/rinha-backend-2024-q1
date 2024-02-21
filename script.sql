DO $$
BEGIN

CREATE TABLE IF NOT EXISTS accounts {
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    limite INT NOT NULL,
    saldo INT NOT NULL
};

CREATE TABLE IF NOT EXITS transaction_1 {
    valor INT NOT NULL,
    tipo VARCHAR(1) NOT NULL,
    descricao VARCHAR(10),
    realizada_em VARCHAR(24)
};

CREATE TABLE IF NOT EXITS transaction_2 {
    valor INT NOT NULL,
    tipo VARCHAR(1) NOT NULL,
    descricao VARCHAR(10),
    realizada_em VARCHAR(24)
};

CREATE TABLE IF NOT EXITS transaction_3 {
    valor INT NOT NULL,
    tipo VARCHAR(1) NOT NULL,
    descricao VARCHAR(10),
    realizada_em VARCHAR(24)
};

CREATE TABLE IF NOT EXITS transaction_4 {
    valor INT NOT NULL,
    tipo VARCHAR(1) NOT NULL,
    descricao VARCHAR(10),
    realizada_em VARCHAR(24)
};

CREATE TABLE IF NOT EXITS transaction_5 {
    valor INT NOT NULL,
    tipo VARCHAR(1) NOT NULL,
    descricao VARCHAR(10),
    realizada_em VARCHAR(24)
};


    INSERT INTO accounts (limite, saldo) VALUES
    (100000,0),
    (80000, 0),
    (1000000, 0),
    (10000000, 0),
    (500000,0)
END; $$