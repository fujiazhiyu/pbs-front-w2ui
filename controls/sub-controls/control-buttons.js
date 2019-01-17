import * as snapshot from '../utils/snapshot.js';


var addControlButtons = function() {
    var control_buttons = $("#control-buttons").load("./views/subviews/control-buttons.html", function() {
        $('#save-button').on('click', onClickSaveButton);
    });
}


var onClickSaveButton = function(event) {
    if (! snapshot.currentStatus.saveStatus) {
        snapshot.currentStatus.saveStatus = true;
    } else {
        alert('already saved');
    }
}


export default addControlButtons;
