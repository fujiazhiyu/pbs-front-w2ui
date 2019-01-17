import selectPolygon from './sub-controls/polygon-selector.js';


const people = ['George Washington', 'John Adams'].sort();

var InitControlPanel = function(type1, type2) {
    console.log("InitControlPanel executes");
    fetch(URL_PREFIX + "/api/datasets/selection")
        .then(response => response.json())
        .then(data => {
            $('input[type=list1]').w2field('list', {
                items: data.records,
            });
            $('input[type=list2]').w2field('list', {
                items: data.records,
            });
        });
    selectPolygon(people);
}


export {
    people,
    InitControlPanel
}
