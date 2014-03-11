$("#lookup-form").submit(function( event ) {
  event.preventDefault();
  $.get("/member/lookup/" + $('#mnum').val(), function(data) {
    console.log(data);
    data = JSON.parse(data);
    $('#firstName').val(data.first);
    $('#lastName').val(data.last);
    $('#major').val(data.major);
    $('#mnum2').val($('#mnum').val());
  });
});
