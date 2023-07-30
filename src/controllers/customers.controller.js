import { db } from "../database/database.connection.js"

export async function getCustomers(req, res) {
    try {
        const customers = await db.query(`SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers;`);
        res.status(200).send(customers.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postCustomers(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    try {
        const c = await db.query('SELECT * FROM customers WHERE cpf = $1',[cpf]);
        if(c.rowCount > 0) return res.status(409).send("Cliente com esse CPF já está na lista!");

        await db.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`, [name, phone, cpf, birthday]);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getCustomersById(req, res) {
    const { id } = req.params;

    try {
        const c = await db.query(`SELECT id, name, phone, cpf, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers WHERE id = $1`,[id]);
        if(c.rowCount === 0) return res.sendStatus(404);

        res.status(200).send(c.rows[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function updateCustomer(req, res) {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;

    
    try {
        const c = await db.query(`SELECT id, cpf FROM customers WHERE cpf=$1`,[cpf]);
        if(c.rowCount > 0 && c.rows[0].id != id) return res.sendStatus(409);

        await db.query(`UPDATE customers SET name=$2, phone=$3, cpf=$4, birthday=$5  WHERE id = $1;`,[id, name, phone, cpf, birthday ]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}