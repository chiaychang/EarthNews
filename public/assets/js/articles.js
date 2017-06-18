

$(document).on("click", ".save-btn", function() {

    var thisId = $(this).attr("id");


    if ($(this).attr("saved") == "false") {

        $(this).text("unsave");
        $(this).parent().css("background-color", "#808080");
        $(this).attr("saved", "true");
        
        $.ajax({
                method: "POST",
                url: "/save/" + thisId,
                data: {
                    // Current saved value
                    saved: true
                }
            })
            // With that done
            .done(function(data) {
                // Log the response
                console.log(data);

            });


    } else if ($(this).attr("saved") == "true") {

        $(this).text("save");
        $(this).parent().css("background-color", "rgba(0, 0, 0, 0.5)");
        $(this).attr("saved", "false");

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

    }

});
