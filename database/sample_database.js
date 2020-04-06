const pins = require('./sample_data.json');

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
