const mysql = require('mysql')
const bcrypt = require("bcrypt-nodejs")

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

connection.connect()

function getAllPins({query, email, liked}, callback) {
    let sql = `select p.*, IF(pl.pin_id IS NULL, 0, 1) as liked from pins p left join pin_likes pl on p.id = pl.pin_id and pl.user_id = (select id from users where email = ?) where p.title like ? or p.description like ?`

    connection.query(sql, [email, `%${query}%`, `%${query}%`], function(error, results, fields) {
        if (error) {
            callback(error);
            return
        }

        callback(null, results)
    })
}
exports.getAllPins = getAllPins

function likePin(email, pin_id, liked, callback) {
    const sql = liked ? `INSERT INTO pin_likes (user_id, pin_id) VALUES ((select id from users where email = ?), ?)` : `DELETE FROM pin_likes WHERE user_id = (select id from users where email = ?) AND pin_id = ?`

    connection.query(sql, [`${email}`, `${pin_id}`], function(error, result, fields) {
        if (error) {
            callback(error);
            return
        }

        callback(null, result)
    })

}
exports.likePin = likePin

function getUser(email, password, callback) {
    const sql = `SELECT * FROM users WHERE email = '${email}'`

    connection.query(sql, function(error, results, fields) {
        if (error) {
            callback(error);
            return
        }

        if (results.length === 0) {
            callback(Error("Incorrect Email"));
            return;
        }

        // Compare the plain text password that's passed in with the hashed password
        if (!bcrypt.compareSync(password, results[0].password)) {
            callback(Error("Incorrect Password"));
            return;
        }

        callback(null, {email})
    })
}
exports.getUser = getUser

function createUser(email, password, callback) {
    // Hash the plain text password
    const hashed = bcrypt.hashSync(password);

    let sql = `INSERT INTO users (email, password) VALUES (?, ?)`

    connection.query(sql, [email, hashed], function(error, result, fields) {
        if (error) {
            callback(error);
            return
        }

        callback(null, { email });
    })
}
exports.createUser = createUser
