function jsonRes<T extends object>(status: number, data: T) {
    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json"
        },
        status
    });
}

interface Account {
    id: number
    limit: number
    balance: number
    transactions: Transaction[]
}

interface Transaction {
    id: number
    value: number
    type: 'c' | 'd'
    created_at: Date
    description: string
}

// sort by date
interface Invoice {
    balance: {
        total: number
        extract_date: Date
        limit: number
    }
    last_transactions: Transaction[]
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

const accounts: Account[] = [
    {id: 1, limit: 100000, balance: 0, transactions: []},
    {id: 2, limit: 80000, balance: 0, transactions: []},
    {id: 3, limit: 1000000, balance: 0, transactions: []},
    {id: 4, limit: 10000000, balance: 0, transactions: []},
    {id: 5, limit: 500000, balance: 0, transactions: []},
]

interface CreateTransactionDTO {
    valor: number
    tipo: 'c' | 'd'
    descricao: string
}

function createTransaction(accountId?: number, createTransactionDTO?: CreateTransactionDTO) {
    if (!accountId || !createTransactionDTO)
        throw new HttpError(400, "Invalid request");
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].id === accountId) {
            accounts[i].transactions.push({
                id: accounts[i].transactions.length + 1,
                value: createTransactionDTO.valor,
                type: createTransactionDTO.tipo,
                created_at: new Date(),
                description: validateDescription(createTransactionDTO.descricao)
            });
            return jsonRes(201, {message: "Transaction created"});
        }
    }
    return jsonRes(404, {message: "Account not found"});
}

Bun.serve({
    port: 5000,
    async fetch(req) {
        const url = new URL(req.url);
        const path = url.pathname.split("/");
        const id = path[2];
        const resource = path[3];
        switch (resource) {
            case "transacoes":
                return createTransaction(parseInt(id), await req.json() as CreateTransactionDTO);
            case "extrato":
                return jsonRes(200, {message: id});
            default:
                return jsonRes(200, {message: "Not Found"});
        }
    },
    error(e) {
        if (e instanceof HttpError)
            return jsonRes(e.status, {message: e.message});
        return jsonRes(500, {message: e.message});
    }
});
