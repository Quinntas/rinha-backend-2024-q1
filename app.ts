import {Pool} from "pg";

function jsonRes<T extends object>(status: number, data: T) {
    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
        },
        status,
    });
}

interface Account {
    id: number;
    limite: number;
    saldo: number;
}

interface Transaction {
    valor: number;
    tipo: "c" | "d";
    realizada_em: string;
    descricao: string;
}

interface Invoice {
    saldo: {
        total: number;
        data_extrato: string;
        limite: number;
    };
    ultimas_transacoes: Transaction[];
}

class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

function validateDescription(description: string): string {
    if (description.length < 1 || description.length > 10)
        throw new HttpError(422, "Description too long");
    return description;
}

interface CreateTransactionDTO {
    valor: number;
    tipo: "c" | "d";
    descricao: string;
}

interface CreateTransactionResponseDTO {
    limite: number;
    saldo: number;
}

let pgClient: Pool;

async function createTransaction(
    accountId?: number,
    createTransactionDTO?: CreateTransactionDTO
) {
    if (!accountId || !createTransactionDTO)
        throw new HttpError(400, "Invalid request");

    const res = await pgClient.query(`
    INSERT INTO transaction_${accountId} (descricao, valor, tipo, realizada_em) 
    VALUES (
        '${validateDescription(createTransactionDTO.descricao)}',
        ${createTransactionDTO.valor}, 
        ${createTransactionDTO.tipo}, 
        '${new Date().toISOString()}'
    );

    UPDATE accounts 
    SET limite = ${0}, saldo = ${0}
    WHERE id = ${accountId};

    SELECT limite, saldo FROM accounts WHERE id = ${accountId};
  `);

    console.log(res);

    return jsonRes<CreateTransactionResponseDTO>(200, {
        limite: 0,
        saldo: 0,
    });
}

async function getInvoice(accountId?: number) {
    if (!accountId) throw new HttpError(400, "Invalid request");

    //TODO join this
    const res = await pgClient.query(`
    SELECT * FROM transaction_${accountId} 
    SORT DESC 
    LIMIT 10;

    SELECT limite, saldo FROM accounts WHERE id = ${accountId};
    `);

    console.log(res);

    return jsonRes<Invoice>(200, {
        saldo: {
            total: 0,
            limite: 0,
            data_extrato: new Date().toISOString(),
        },
        ultimas_transacoes: [],
    });
}

(async () => {
    pgClient = new Pool({
        host: "localhost",
        port: 5432,
        database: "rinha",
        user: "root",
        password: "rootpwd",
        max: 10,
    });
    await pgClient.connect();
})();

Bun.serve({
    port: 5000,
    async fetch(req) {
        console.log("http://localhost:5000");
        const url = new URL(req.url);
        const path = url.pathname.split("/");
        const id = parseInt(path[2]);
        if (id >= 1 && id <= 5) return jsonRes(404, {message: "Not Found"});
        switch (path[3]) {
            case "transacoes":
                return createTransaction(
                    id,
                    (await req.json()) as CreateTransactionDTO
                );
            case "extrato":
                return getInvoice(id);
            default:
                return jsonRes(404, {message: "Not Found"});
        }
    },
    error(e) {
        if (e instanceof HttpError)
            return jsonRes(e.status, {message: e.message});
        return jsonRes(500, {message: e.message});
    },
});