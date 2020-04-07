const pins = require('./sample_data.json');
const bcrypt = require("bcrypt-nodejs")

exports.getAllPins = function getAllPins(options, callback) {
    let resultSet = pins;

    if (options.liked !== undefined)
        resultSet = resultSet.filter((pin) => {
            return (options.liked) ? pin.liked : !pin.liked;
        })

    if (options.query !== undefined)
        resultSet = resultSet.filter((pin) => {
            return pin.title.includes(options.query) || pin.description.includes(options.query) || pin.author.includes(options.query);
        })

    resultSet = resultSet.slice((options.page-1) * options.per_page, options.page * options.per_page);

    setTimeout(() => {
        callback(null, resultSet)
    }, 0)
};

exports.getPin = function getPin(id, callback) {
    if (!id) {
        callback(Error("🤷‍♂️"));
        return
    }

    const pin = pins.find((pin) => {
        return pin.id === id;
    })

    setTimeout(() => {
        callback(null, pin)
    }, 0)
};

exports.getAllUserPins = function getAllUserPins(options, callback) {
    if (!options.author) {
        callback(Error("🤷‍♂️"));
        return
    }

    let resultSet = pins.filter((pin) => {
        return pin.author === options.author;
    })

    resultSet = resultSet.slice((options.page-1) * options.per_page, options.page * options.per_page);

    setTimeout(() => {
        callback(null, resultSet)
    }, 0)
};

const users = [
    {
        email: 'test_user',
        password: '$2b$12$iuGMRmnF87pRufuqvKL2F.LfKN7aipZcm6QVfWtWulGXmfkSSxu4.' // password1 hashed using bcrypt
    }
]

exports.getUser = function getUser(email, password, callback) {
    console.log(email, password);
    // Get the user with the passed in email
    const user = users.find(user => user.email === email);

    if (!user) {
        callback(Error("Incorrect Email"));
        return;
    }

    // Compare the plain text password that's passed in with the hashed password
    if (!bcrypt.compareSync(password, user.password)) {
        callback(Error("Incorrect Password"));
        return;
    }

    // If that user exists and the password is correct, return the user
    callback(null, { email: user.email });
}

exports.createUser = function createUser(email, password, callback) {
    // Hash the plain text password
    const hashed = bcrypt.hashSync(password);

    // Save the user to the "database"
    const user = { email, password: hashed };
    users.push(user);

    callback(null, { email });
}
