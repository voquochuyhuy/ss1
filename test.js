// const test = {
//     "youarehere_NODE": {
//         "L4_PATH_70_NODE": 27,
//         "L4_PATH_43_NODE": 27,
//         "L4_PATH_10_NODE": 71,
//         "L4_PATH_45_NODE": 53,
//         "L4_24_NODE": 66
//     },
//     "L4_PATH_70_NODE": {
//         "youarehere_NODE": 27,
//         "L4_PATH_69_NODE": 22,
//         "L4_PATH_44_NODE": 18
//     }
// };
const _ = require("lodash");
// if (_.has(test, ['youarehere_NODE', 'L4_PATH_70_NODE']) && _.has(test, ['L4_PATH_70_NODE', 'youarehere_NODE'])) {
//     delete test['L4_PATH_70_NODE']['youarehere_NODE'];
//     delete test['youarehere_NODE']['L4_PATH_70_NODE'];
//     console.log(test);
// }
var data = [{
    "name": "jim",
        "color": "blue",
        "age": "22"
}, {
    "name": "Sam",
        "color": "blue",
        "age": "33"
}, {
    "name": "eddie",
        "color": "green",
        "age": "77"
}];

var result = _.chain(data)
    .groupBy("color")
    .toPairs()
    .map(function (currentItem) {
        return _.zipObject((["color", "users"], currentItem));
    })
    .value();
console.log(result);
