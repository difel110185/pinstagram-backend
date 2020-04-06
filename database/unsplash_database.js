const axios = require("axios");

exports.getAllPins = function getAllPins({query}, callback) {
    let url = `https://api.unsplash.com/search/photos?page=1&per_page=100`
    url+='&client_id=mibyxpcYkfY2kvWPWuVRSF2syIdWa8pcPCFM4kS7K-s'
    url+=`&query=${query}`
    console.log(url)
    return axios.get(url)
        .then(data => data.data.results)
        .then(data => data.map(datum => {
            return {
                ...datum,
                description: datum.description || datum.alt_description,
                image: datum.urls.regular,
                title: datum.tags[0].title,
                author: datum.user.username,
            }
        }))
        .then(data => {
            callback(null, data)
        })
}

exports.getPin = function getPin(id, callback) {
    throw new Error("Not implemented");
};

exports.getAllUserPins = function getAllUserPins(options, callback) {
    throw new Error("Not implemented");
};
