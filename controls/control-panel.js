import selectPolygon from './sub-controls/polygon-selector.js';


const people = ['George Washington', 'John Adams'].sort();

var InitControlPanel = function(type1, type2) {
    console.log("InitControlPanel executes");
    $('input[type=list1]').w2field('list', { items: people });
    $('input[type=list2]').w2field('list', { items: people });
    selectPolygon(people);
}

export {people, InitControlPanel}
