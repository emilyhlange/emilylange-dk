$('.custom-btn-container').draggable({});

$('.draggable-image').draggable({stack: "div", scroll: false });

// Dropzone testing

  $(document).ready(function() {
    $('#photos img').draggable({
        start: function (event, ui){
            ui.helper.css('transform', 'rotate(5deg) scale(1.5)')
        },
        stop: function (event, ui){
            ui.helper.css('transform', 'rotate(0deg) scale(1)');
        },
        zIndex: 100
    });

/*     $('#folder').droppable({
        activeClass: 'highlight',
        drop: function(event, ui){
            ui.helper.hide('explode');
        }
    })

    $('#folder').draggable({
    })
 */

    $('#dropZone').droppable({
        activeClass: 'highlight',
        drop: function(event, ui){
            ui.helper.hide('fade');
        },
        zIndex: -100
    })

  });