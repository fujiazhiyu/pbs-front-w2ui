var initSolutionsThumbnail = function(callback = () => {}) {
    $('#solutions-thumbnail').load('./views/subviews/solutions-thumbnail.html', function() {
        callback()
    });
}


export {initSolutionsThumbnail};
