//
//	Servicio rest en Node.js con express para la aplicacion de intercambios
//


//	Dependencias de la aplicacion 

var application_root = __dirname,
    express = require("express"),
	mysql = require('mysql');
    path = require("path");

var app = express();

// Conexion a la Base de datos

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


//o__o!!!!
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

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
        '<h3>Metodos GET:</h3>'+
  			'<li>Lista de todos los eventos              : eventos </li>'+
  			'<li>Lista de todos los eventos de un usuario : eventos/usuario/:id </li>'+
  			'<li>Lista de todos usuarios				  : usuarios </li>'+
        '<li>Lista de todos los eventos del administrador : eventos/admin/:id </li>'+
        '<li>Muestra los detalles de un evento : evento/:id'+
        '<h3>Metodos POST:</h3>'+
        '<li>Crear un nuevo evento          : evento </li>'+
        '<div>{"creador":id,"nombre":"nombre","fecha":"2013/12/24","participantes":99,"precio":100}</div>'+
        '<h3>Metodos PUT:</h3>'+
        '<li>Actualiza la informacion de un evento : evento/:id</li>'+
        '<div>{"creador":id,"nombre":"nombre","fecha":"2013/12/24","participantes":99,"precio":100}</div>'+
  			'<h3>Metodos DELETE:</h3>'+
        '<li>Elimina un evento : evento/:id</li>'+
        '</ul>'
  			);
});


/*************************/
//       Metodos GET     
/*************************/

//Regresa todos los usuarios registrados en la aplicación
app.get('/usuarios', function (req, res) {
   connection.query('SELECT id,nombre,email,fecha FROM intercambios_usuario;', function (error, rows, fields) { 
      console.log(error);
         res.writeHead(200, { 'Content-Type': 'application/json' });
		 res.end(JSON.stringify(rows));
      }); 
});

//Regresa todos los eventos registrados en la aplicación
app.get('/eventos', function (request, res) {
    //res.writeHead(200, {'Content-Type': 'application/json'}); 
   connection.query('SELECT * FROM intercambios_evento;', function (error, rows, fields) { 
   
	res.writeHead(200, {'Content-Type': 'application/json'});
    res.end( JSON.stringify(rows));
    
   });
		 
});

//Regresa un evento
app.get('/evento/:id', function (req, res){
  connection.query('SELECT * FROM intercambios_evento where id ='+req.params.id+';', function (error, rows, fields) {
      res.header('Access-Control-Allow-Origin', "*");    
      res.end( JSON.stringify(rows[0]));
    
  }); 
});

//Regresa todos los eventos de un usuario en especifico
app.get('/eventos/usuario/:id', function (req, res){
	connection.query('SELECT * FROM intercambios_evento where id in (SELECT evento_id   FROM intercambios_participantesevento WHERE usuario_id='+req.params.id+' and estado="activo")', function (error, rows, fields) {
 
 
         res.writeHead(200, {'Content-Type': 'application/json'});
		 res.end(JSON.stringify(rows));
		
      }); 
});

//Regresa todos los eventos donde el usuario es admin
app.get('/eventos/admin/:id', function (req, res){
  connection.query('SELECT * FROM intercambios_evento where admin_id ='+req.params.id, function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'application/json'});
     res.end(JSON.stringify(rows));
    
      }); 
});

/*************************/
//       Metodos POST     
/*************************/

//Crea un nuevo evento
app.put('evento', function(req, res) {

  var nombre = req.body.nombre;
  var fecha = new Date(req.body.fecha_evento);
  var fecha = formatDate(fecha);
  var participantes = req.body.numero_participantes;
  var precio = req.body.precio;
  var activo = "activo";
  var admin_id = req.body.admin_id;


  connection.query('INSERT into intercambios_evento ( admin_id, nombre , fecha_evento, numero_participantes, precio, fecha_creacion,estado ) values ('+"'"+admin_id+"'"+',' + "'"+ nombre +"'" +',' + "'"+ fecha +"'" +',' + "'"+ participantes +"'" +',' + "'"+ precio +"',NOW()," +"'"+activo+"'"+');', function (error, rows, fields) {  
      connection.query('INSERT into intercambios_participantesevento (usuario_id, evento_id, fecha ) values ('+"'"+admin_id+"'"+','+"'"+rows['insertId']+"',NOW()"+');', function (error, rows, fields) { 
         res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(rows));
      }); 
  }); 

});


/*************************/
//       Metodos PUT     
/*************************/

//Actualiza la informacion de un evento
app.put('/evento/:id', function(req, res) {

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
  //var fecha = new Date(req.body.fecha);
  //var fecha = formatDate(fecha);
  var participantes = req.body.numero_participantes;
  var precio = req.body.precio;

  //connection.query('update intercambios_evento set nombre = "' + nombre +'", fecha_evento = "'+fecha+'", numero_participantes = "'+participantes+'", precio = "'+precio+'" where id= '+req.params.id+ ';',function (error, rows, fields) {
  connection.query('update intercambios_evento set nombre = "' + nombre +'", numero_participantes = "'+participantes+'", precio = "'+precio+'" where id= '+req.params.id+ ';',function (error, rows, fields) {
  }); 

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Se modifico correctamente el evento:'+req.params.id);


});

//Cancela un evento
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


/*************************/
//       Metodos DELETE     
/*************************/

app.delete('/evento/:id', function(req, res) {
	  
	  connection.query('delete from intercambios_evento where id= '+req.params.id+ ';',function (error, rows, fields) {
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
