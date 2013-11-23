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
host : 'localhost',
user : 'root',
password : 'root',
database: 'intercambios',
port: 8889
});

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
  			'<li>Lista de todos los eventos              : /get/eventos/ </li>'+
  			'<li>Lista de todos los eventos de un usuario : /get/eventos/user/:id </li>'+
  			'<li>Lista de todos usuarios				  : /get/usuarios/ </li>'+
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
         res.writeHead(200, { 'Content-Type': 'application/json' });
		 res.end(JSON.stringify(rows));
      }); 
});

//Regresa todos los eventos de un usuario en especifico
app.get('/get/eventos/usuario/:id', function (req, res){
	connection.query('SELECT * FROM intercambios_evento where admin_id ='+req.params.id, function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'application/json'});
		 res.end(JSON.stringify(rows));
		
      }); 
});

app.get('/usuario/:id', function (req, res){
	connection.query('SELECT * FROM user where id ='+req.params.id, function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'application/json'});
		 res.end(JSON.stringify(rows));
		
      }); 
});

app.post('/post/evento', function(req, res) {
  //fecha debe tener este formato: YYYY/mm/ddd ej: 2013/12/24
  if(!req.body.hasOwnProperty('nombre') || 
     !req.body.hasOwnProperty('fecha')) {
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

  connection.query('insert into intercambios_evento ( admin_id, nombre , fecha_evento, numero_participantes, precio, fecha_creacion ) values (' + "'1','" + nombre +"'" +',' + "'"+ fecha +"'" +',' + "'"+ participantes +"'" +',' + "'"+ precio +"',NOW()" +');', function (error, rows, fields) { 
   console.log(error);
   connection.query('SELECT * FROM intercambios_evento where id ='+rows.insertID, function (error, rows, fields) { 
     res.writeHead(200, {'Content-Type': 'application/json'});
     res.end(JSON.stringify(rows));
    
      }); 
    
    
          }); 

  res.writeHead(200, {'Content-Type': 'application/json'});
  res.json()


});


app.post('/insertuser', function (req, res){
  console.log("POST: ");
  
  username = req.body.user;
  password = req.body.user;
  console.log('insert into user ( username , password ) values (' + "'" + username +"'" +',' + "'"+ password +"'" +');');
  connection.query('insert into user ( username , password ) values (' + "'" + username +"'" +',' + "'"+ password +"'" +');', function (error, rows, fields) { 
		//console.log(error);
         res.writeHead(200, {'Content-Type': 'text/plain'});
		 
			res.end( 'record inerted...');
		      }); 
});

//Formateo para poder guardar fechas en mysql
function formatDate(date) {
  return date.getFullYear() + '-' +
    (date.getMonth() < 9 ? '0' : '') + (date.getMonth()+1) + '-' +
    (date.getDate() < 10 ? '0' : '') + date.getDate();
}

// Launch server
app.listen(1212);