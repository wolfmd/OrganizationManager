$("#lookup-form").submit(function( event ) {
  event.preventDefault();
  $.get("/member/lookup/" + $('#mnum').val(), function(data) {
    $('#firstName').val(data.first_name);
    $('#lastName').val(data.last_name);
    $('#major').val(data.major);
    $('#mnum2').val($('#mnum').val());
  });
});
