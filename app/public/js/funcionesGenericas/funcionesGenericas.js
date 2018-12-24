peticion=function(url,type,datos,modal,redireccion){
  $.ajax({
        url: url,
        type: type,
        data: datos
      }).done(function(data){
        $(modal).modal('hide')
        alert(data.mensaje);
        location.href = redireccion;
      })//fin de ajax
}//fnin de funcino peticion