//
//	Servicio rest en Node.js con express para la aplicacion de intercambios
//


//	Dependencias de la aplicacion 

var application_root = __dirname,
    express = require("express"),
	mysql = require('mysql');
    path = require("path");

var app = express();

// Base de datos

var connection = mysql.createConnection({
host : 'intercambios2013.db.10388631.hostedresource.com',
user : 'intercambios2013',
password : 'Intercambios!1',
database: 'intercambios2013',
port: 3306
});


// var connection = mysql.createConnection({
// host : 'localhost',
// user : 'root',
// password : 'root',
// database: 'intercambios',
// port: '8889'
// });

// Configuracion inicial

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function (req, res) {
  res.send('Api Intercambios REST:</br>'+
  			'<ul>'+
        '<h3>Metodos get:</h3>'+
  			'<li>Lista de todos los eventos              : /get/eventos </li>'+
  			'<li>Lista de todos los eventos de un usuario : /get/eventos/usuario/:id </li>'+
  			'<li>Lista de todos usuarios				  : /get/usuarios </li>'+
        '<li>Lista de todos los eventos del administrador : /get/eventos/admin/:id </li>'+
        '<li>Muestra los detalles de un evento : get/evento/:id'+
        '<h3>Metodos post</h3>'+
        '<li>Crear un nuevo evento          : /post/evento </li>'+
        '<div>{"creador":id,"nombre":"nombre","fecha":"2013/12/24","participantes":99,"precio":100}</div>'+
        '<h3>Metodos put</h3>'+
        '<li>Actualiza la informacion de un evento : /update/evento/:id</li>'+
        '<div>{"creador":id,"nombre":"nombre","fecha":"2013/12/24","participantes":99,"precio":100}</div>'+
  			'</ul>'
  			);
});


//Regresa todos los usuarios registrados en la aplicación
app.get('/get/usuarios', function (req, res) {
   connection.query('SELECT id,nombre,email,fecha FROM intercambios_usuario;', function (error, rows, fields) { 
         res.writeHead(200, { 'Content-Type': 'application/json' });
		 res.end(JSON.stringify(rows));
      }); 
});

//Regresa todos los eventos registrados en la aplicación
app.get('/get/eventos', function (req, res) {
   connection.query('SELECT * FROM intercambios_evento;', function (error, rows, fields) { 
    console.log(error);
         res.writeHead(200, { 'Content-Type': 'application/json' });
		 res.end(JSON.stringify(rows));
      }); 
});

//Regresa todos los eventos de un usuario en especifico
app.get('/get/eventos/usuario/:id', function (req, res){
	connection.query('SELECT * FROM intercambios_evento where id in (SELECT evento_id   FROM intercambios_participantesevento WHERE usuario_id='+req.params.id+' and estado="activo")', function (error, rows, fields) {
 
 
          res.writeHead(200, {'Content-Type': 'application/json'});
		 res.end(JSON.stringify(rows));
		
      }); 
});

app.get('/get/evento/:id', function (req, res){
  connection.query('SELECT * FROM intercambios_evento where id ='+req.params.id+';', function (error, rows, fields) {
 
 
          res.writeHead(200, {'Content-Type': 'application/json'});
     res.end(JSON.stringify(rows));
    
      }); 
});

app.get('/get/eventos/admin/:id', function (req, res){
  connection.query('SELECT * FROM intercambios_evento where admin_id ='+req.params.id, function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'application/json'});
     res.end(JSON.stringify(rows));
    
      }); 
});



app.post('/post/evento', function(req, res) {
  if(!req.body.hasOwnProperty('nombre') || 
     !req.body.hasOwnProperty('fecha')) {
    res.statusCode = 400;
    return res.send('Error 400, el formato del post JSON es incorrecto debe ser:'+
      '{'+
        '"creador":id,'+
        '"nombre":"nombre",'+
        '"fecha":"2013/12/24",'+
        '"participantes":99,'+
        '"precio":100'+      
      '}');
  }

  var nombre = req.body.nombre;
  var fecha = new Date(req.body.fecha);
  var fecha = formatDate(fecha);
  var participantes = req.body.participantes;
  var precio = req.body.precio;
  var creador = req.body.creador;
  var activo = "activo";
  
  //console.log('insert into intercambios_evento ( admin_id, nombre , fecha_evento, numero_participantes, precio, fecha_creacion,estado ) values (2,' + "'"+ nombre +"'" +',' + "'"+ fecha +"'" +',' + "'"+ participantes +"'" +',' + "'"+ precio +"',NOW()" +"'"+activo+"'"+');');
  connection.query('INSERT into intercambios_evento ( admin_id, nombre , fecha_evento, numero_participantes, precio, fecha_creacion,estado ) values ('+"'"+creador+"'"+',' + "'"+ nombre +"'" +',' + "'"+ fecha +"'" +',' + "'"+ participantes +"'" +',' + "'"+ precio +"',NOW()," +"'"+activo+"'"+');', function (error, rows, fields) {  
 // console.log('INSERT into intercambios_participantesevento (usuario_id, evento_id, fecha ) values ('+"'"+creador+"'"+','+"'"+rows['insertId']+"',NOW()"+');');
  connection.query('INSERT into intercambios_participantesevento (usuario_id, evento_id, fecha ) values ('+"'"+creador+"'"+','+"'"+rows['insertId']+"',NOW()"+');', function (error, rows, fields) { 
  //    console.log(error);
    console.log(error);
      //console.log(error);
     console.log(JSON.stringify(rows));
       
     // console.log(evento_id);

     res.writeHead(200, {'Content-Type': 'application/json'});
     res.end(JSON.stringify(rows));
    
      }); 
    
    
          }); 



});
app.put('/update/evento/:id', function(req, res) {
  //fecha debe tener este formato: YYYY/mm/ddd ej: 2013/12/24
  if(!req.body.hasOwnProperty('nombre') || 
  //   !req.body.hasOwnProperty('fecha')) ||
  //   !req.body.hasOwnProperty('participantes')) ||
     !req.body.hasOwnProperty('precio')) {
    res.statusCode = 400;
    return res.send('Error 400, el formato del post JSON es incorrecto debe ser:'+
      '{'+
        '"nombre_evento":"nombre_evento",'+
        '"fecha":"2013/12/24",'+
        '"participantes":99,'+
        '"precio":100'+      
      '}');
  }

  var nombre = req.body.nombre;
  var fecha = new Date(req.body.fecha);
  var fecha = formatDate(fecha);
  var participantes = req.body.participantes;
  var precio = req.body.precio;

  connection.query('update intercambios_evento set nombre = "' + nombre +'", fecha_evento = "'+fecha+'", numero_participantes = "'+participantes+'", precio = "'+precio+'" where id= '+req.params.id+ ';',function (error, rows, fields) {
   console.log(error);
   
    
    
          }); 

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Se modifico correctamente el evento:'+req.params.id);


});

app.put('/cancelar/evento/:id', function(req, res) {
  

  var nombre = req.body.nombre;
  var fecha = new Date(req.body.fecha);
  var fecha = formatDate(fecha);
  var participantes = req.body.participantes;
  var precio = req.body.precio;

  connection.query('update intercambios_evento set estado = "cancelado" where id= '+req.params.id+ ';',function (error, rows, fields) {
   console.log(error);
   
    
    
          }); 

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Se cancelo el evento:'+req.params.id);


});




//Formateo para poder guardar fechas en mysql
function formatDate(date) {
  return date.getFullYear() + '-' +
    (date.getMonth() < 9 ? '0' : '') + (date.getMonth()+1) + '-' +
    (date.getDate() < 10 ? '0' : '') + date.getDate();
}

// Launch server
//app.listen(5000);

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
