const database = require('./database/unsplash_database')
const app = require('./app')(database)

app.listen(8080, () => {
    console.log("listening on port 8080")
})
