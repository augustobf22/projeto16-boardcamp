import { db } from "../database/database.connection.js"
import dayjs from "dayjs";

export async function getRentals(req, res) {
    try {
        const rentals = await db.query(`
            SELECT 
                rentals.id, 
                rentals."customerId", 
                rentals."gameId", 
                TO_CHAR(rentals."rentDate", 'YYYY-MM-DD') AS "rentDate",
                rentals."daysRented", 
                rentals."returnDate", 
                rentals."originalPrice", 
                rentals."delayFee",
                customers.id AS cid,
                customers.name AS cname,
                games.id AS gid,
                games.name AS gname
            FROM rentals
            JOIN customers 
            ON customers.id = rentals."customerId"
            JOIN games 
            ON games.id = rentals."gameId"
            ;`);
        
        let formattedRental = [];
        for (let i=0; i<rentals.rowCount; i++){
            const r = rentals.rows[i];
            const tempRental = {
                id: r.id,
                customerId: r.customerId, 
                gameId: r.gameId, 
                rentDate: r.rentDate,
                daysRented: r.daysRented,
                returnDate: r.returnDate,
                originalPrice: r.originalPrice,
                delayFee: r.delayFee,
                customer: {
                    id: r.cid,
                    name: r.cname
                },
                game: {
                    id: r.gid,
                    name: r.gname
                }
            }; 
            formattedRental.push(tempRental);
        };
            
        res.status(200).send(formattedRental);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function postRentals(req, res) {
    const { customerId, gameId, daysRented } = req.body;
    const rentDate = dayjs(Date.now()).format('YYYY-MM-DD');

    try {
        const custCheck = await db.query(`SELECT id FROM customers WHERE id = $1`, [customerId]);
        if(custCheck.rowCount === 0) return res.status(400).send("Cliente não foi cadastrado ainda!");

        const gameCheck = await db.query(`SELECT id, "stockTotal" FROM games WHERE id = $1`, [gameId]);
        if(gameCheck.rowCount === 0) return res.status(400).send("Jogo não foi cadastrado ainda!");

        const rentCheck = await db.query(`SELECT * FROM rentals WHERE "gameId" = $1`, [gameId]);
        if(Number(rentCheck.rowCount) === Number(gameCheck.rows[0].stockTotal)) return res.status(400).send("Acabou o estoque desse jogo!");

        const price = await db.query(`SELECT "pricePerDay" FROM games WHERE id = $1`,[gameId]);
        const originalPrice = Number(price.rows[0].pricePerDay)*Number(daysRented);

        await db.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, null, $5, null);`, [customerId, gameId, rentDate, daysRented, originalPrice]);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function returnRentals(req, res) { 
    const returnId = req.params.id;

    const returnDate = dayjs(Date.now()).format('YYYY-MM-DD');

    try {
        const returnQuery = await db.query(`SELECT "returnDate", "rentDate", "daysRented", "delayFee", "originalPrice" FROM rentals WHERE id = $1`, [returnId]);
        if(returnQuery.rowCount === 0) return res.status(404).send("Aluguel não existe!");
        if(returnQuery.rows[0].returnDate !== null) return res.status(400).send("Aluguel já foi finalizado!");

        const returnOriginal = dayjs(returnQuery.rows[0].rentDate).add(returnQuery.rows[0].daysRented, 'day').format('YYYY-MM-DD');
        const dateDifference = dayjs(returnDate).diff(returnOriginal, 'day');
        const pricePerDay = Number(returnQuery.rows[0].originalPrice) / Number(returnQuery.rows[0].daysRented);
        const newDelayFee = (dateDifference > 0) ? dateDifference*pricePerDay : null;

        await db.query(`UPDATE rentals SET "returnDate"=$2, "delayFee"=$3 WHERE id = $1;`,[returnId, returnDate, newDelayFee]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function deleteRentals(req, res) {
    const deleteId = req.params.id;

    try {
        const deleteQuery = await db.query(`SELECT * FROM rentals WHERE id = $1`, [deleteId]);
        if(deleteQuery.rowCount === 0) return res.status(404).send("Aluguel não existe!");
        if(deleteQuery.rows[0].returnDate === null) return res.status(400).send("Aluguel não finalizado!");

        await db.query(`DELETE FROM rentals WHERE id=$1`, [deleteId]);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
}