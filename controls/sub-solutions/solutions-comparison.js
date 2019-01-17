import * as snapshot from '../utils/snapshot.js';


var solutionParams = {
    'solutionId': 'S1',
    'roads': [{"width": 90, "height": 20, "opacity": 0.7},
              {"width": 60, "height": 30, "opacity": 0.6},
              {"width": 50, "height": 10, "opacity": 0.3},
              {"width": 70, "height": 20, "opacity": 0.5},
              {"width": 40, "height": 30, "opacity": 0.8}],
    'loopback': 3,
    'foldback': 4
}


var loadSolutions = function() {
    addOneSolutionItem(solutionParams);
    addOneSolutionItem(solutionParams);
    tabButtons(['compare-button', 'return-thumbnail']);
}


var addOneSolutionItem = function(solutionItem) {
    var item = '<tr><td>'+
               solutionItem.solutionId +
               '</td><td id="solution-'+ solutionItem.solutionId +'"><div class="solution-indicator">'+
               solutionItem.roads.reduce(function(total, cv) { return total + '<div style="width:'+cv.width+'px;height:'+cv.height+'px;opacity:'+cv.opacity+'"></div>'; }, '') +
               '</div></td><td><div class="concentric-circles-container">' +
               Array(solutionItem.loopback).fill('').reduce(function(total) { return '<div class="concentric-circles">' + total + '</div>'; }, '') +
               '</div></td><td><div class="foldback">' +
               Array(solutionItem.foldback).fill('').reduce(function(total, cv, ci) { return total+'<div class="slopingside-' + (ci%2===0?'right':'left') + '"></div>'; }, '') +
               '</div></td>';
    $('#solutions-comparison tbody').append(item);
}


var tabButtons = function(ids) {
    ids.map(function(val, idx) {
        $('#'+val).css('display', $('#'+val).css('display') === 'none' ? 'flex' : 'none');
    });
}


export {loadSolutions, tabButtons};
