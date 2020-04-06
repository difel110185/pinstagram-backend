const request = require('supertest');
const database = require('./mock_database');
const app = require('../app')(database);

beforeEach(() => {
    database.shouldFail = false;
    database.page = 1;
    database.per_page = 10;
});

describe("When making a GET request to /api/pins", function() {
    test("should respond with a 200 status", (done) => {
        request(app).get('/api/pins').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        })
    });

    test("should respond the results from the database", (done) => {
        request(app).get('/api/pins').then((response) => {
            expect(response.body.results).toStrictEqual(database.pins.slice(0,database.per_page));
            done();
        })
    });

    test("should respond with a 500 status code when the database fails", (done) => {
        database.shouldFail = true;
        request(app).get('/api/pins').then((response) => {
            expect(response.statusCode).toBe(500);
            done();
        })
    });

    test("should return the total number of items", (done) => {
        request(app).get('/api/pins').then((response) => {
            expect(response.body.total).toStrictEqual((database.pins.length < database.per_page) ? database.pins.length : database.per_page);
            done();
        })
    });

    test("should return only the liked pins", (done) => {
        request(app).get('/api/pins?liked=true').then((response) => {
            const liked = database.pins.filter((pin) => {
                return pin.liked;
            })
            expect(response.body.total).toStrictEqual(liked.length);
            expect(response.body.results).toStrictEqual(liked);
            done();
        })
    });

    test("should return only the not liked pins", (done) => {
        request(app).get('/api/pins?liked=false').then((response) => {
            const notLiked = database.pins.filter((pin) => {
                return !pin.liked;
            })
            expect(response.body.total).toStrictEqual((notLiked.length < database.per_page) ? notLiked.length : database.per_page);
            expect(response.body.results).toStrictEqual(notLiked.slice(0, database.per_page));
            done();
        })
    });

    test("should return paged result", (done) => {
        const page = 2;
        const per_page = 3;

        request(app).get(`/api/pins?page=${page}&per_page=${per_page}`).then((response) => {
            expect(response.body.total).toStrictEqual((database.pins.length >= page * per_page) ? per_page : (((page-1) * per_page > database.pins.length) ? 0 : database.pins.length % per_page));
            expect(response.body.results).toStrictEqual([database.pins[3],database.pins[4],database.pins[5]]);
            done();
        })
    });

    test("should return 0 results when page is too big", (done) => {
        const page = database.pins.length;
        const per_page = 3;

        request(app).get(`/api/pins?page=${page}&per_page=${per_page}`).then((response) => {
            expect(response.body.total).toStrictEqual((database.pins.length >= page * per_page) ? per_page : (((page-1) * per_page > database.pins.length) ? 0 : database.pins.length % per_page));
            expect(response.body.results).toStrictEqual([]);
            done();
        })
    });

    test("should return all pins when per_page is too big", (done) => {
        const page = 1;
        const per_page = database.pins.length * 2;

        request(app).get(`/api/pins?page=${page}&per_page=${per_page}`).then((response) => {
            expect(response.body.total).toStrictEqual((database.pins.length >= page * per_page) ? per_page : (((page-1) * per_page > database.pins.length) ? 0 : database.pins.length % per_page));
            expect(response.body.results).toStrictEqual(database.pins);
            done();
        })
    });

    test("should return only the matching pins", (done) => {
        const query = "Yoda";

        request(app).get(`/api/pins?query=${query}`).then((response) => {
            const matched = database.pins.filter((pin) => {
                return pin.title.includes(query) || pin.description.includes(query) || pin.author.includes(query);
            })
            expect(response.body.total).toStrictEqual((matched.length < database.per_page) ? matched.length : database.per_page);
            expect(response.body.results).toStrictEqual(matched.slice(0, database.per_page));
            done();
        })
    });

    test("should return only the matching pins - empty result set", (done) => {
        const query = "Xuxaasdasdasd";

        request(app).get(`/api/pins?query=${query}`).then((response) => {
            const matched = database.pins.filter((pin) => {
                return pin.title.includes(query) || pin.description.includes(query) || pin.author.includes(query);
            })
            expect(response.body.total).toStrictEqual((matched.length < database.per_page) ? matched.length : database.per_page);
            expect(response.body.results).toStrictEqual(matched.slice(0, database.per_page));
            done();
        })
    });

    test("should return only the matching pins - empty query", (done) => {
        const query = "";

        request(app).get(`/api/pins?query=${query}`).then((response) => {
            const matched = database.pins.filter((pin) => {
                return pin.title.includes(query) || pin.description.includes(query) || pin.author.includes(query);
            })
            expect(response.body.total).toStrictEqual((matched.length < database.per_page) ? matched.length : database.per_page);
            expect(response.body.results).toStrictEqual(matched.slice(0, database.per_page));
            done();
        })
    });
});

describe("When making a GET request to /api/pins/:id", function() {
    test("should respond with a 200 status", (done) => {
        request(app).get('/api/pins/1').then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        })
    });

    test("should respond with a 404 status if cannot find item with given id", (done) => {
        request(app).get('/api/pins/149494949494').then((response) => {
            expect(response.statusCode).toBe(404);
            done();
        })
    });

    test("should respond the right pin", (done) => {
        const id = 1;
        request(app).get(`/api/pins/${id}`).then((response) => {
            const pin = database.pins.find((pin) => {
                return pin.id = id
            })
            expect(response.body.result).toStrictEqual(pin);
            done();
        })
    });
});

describe("When making a GET request to /api/users/:author/pins", function() {
    const author = "Woof woof";
    test("should respond with a 200 status", (done) => {
        request(app).get(`/api/users/${author}/pins`).then((response) => {
            expect(response.statusCode).toBe(200);
            done();
        })
    });

    test("should respond the right pins", (done) => {
        const author = "Woof woof";
        request(app).get(`/api/users/${author}/pins`).then((response) => {
            let pins = database.pins.filter((pin) => {
                return pin.author === author;
            })
            expect(response.body.total).toStrictEqual((pins.length < database.per_page) ? pins.length : database.per_page);
            expect(response.body.results).toStrictEqual(pins);
            done();
        })
    });
});
