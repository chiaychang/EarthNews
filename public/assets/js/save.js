$(document).on("click", ".unsave-btn", function() {

    var thisId = $(this).attr("id");

    $(this).parent().css("display", "none");

    $.ajax({
            method: "POST",
            url: "/save/" + thisId,
            data: {
                // Current saved value
                saved: false
            }
        })
        // With that done
        .done(function(data) {
            // Log the response
            console.log(data);

        });
});


// Whenever someone clicks a p tag
$(document).on("click", ".note-btn", function() {
  
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
        // With that done, add the note information to the page
        .done(function(data) {
            console.log(data);

            // If there's a note in the article
            if (data.note) {
                // Place the title of the note in the title input
                $("#titleinput").val(data.note.title);
                // Place the body of the note in the body textarea
                $("#bodyinput").val(data.note.body);
            }
        });
});

// When you click the savenote button
$(document).on("click", ".savenote-btn", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
            method: "POST",
            url: "/articles/" + thisId,
            data: {
                // Value taken from title input
                title: $("#titleinput").val(),
                // Value taken from note textarea
                body: $("#bodyinput").val()
            }
        })
        // With that done
        .done(function(data) {
            // Log the response
            console.log(data);
                // Also, remove the values entered in the input and textarea for note ent

            // Empty the notes section
        });


});
