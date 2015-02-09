oracle = require "oracle-changed"
io = require "socket.io"
.listen 8080

io.on "connection", (socket) ->
	socket.emit "socketnews", message: "socket connection established successfully"
	socket.on "query", (query) ->
		console.log query
		socket.emit "socketnews", message: "query event has run", query: query
		oracle.connect
			hostname: "192.168.1.101"
			port: 1521
			database: "PDBORCL"
			user: "ticket_b2c"
			password: "qweqwe", (oracleConnectError, connection) ->
				if oracleConnectError
					socket.emit "socketnews", message: "Error connecting to db", error: oracleConnectError
					return
				socket.emit "socketnews", message: "connection to db established successfully", connection: connection
				connection.execute "declare begin :res := TICKET_B2C.b2e_gateway_api.Request(:xreq,''); end;", [new oracle.OutParam(oracle.OCCICLOB), query], (connectionExecuteError, results) ->
					if connectionExecuteError
						socket.emit "socketnews", message: "Error executing to db", error: connectionExecuteError
						do connection.close
						return
					socket.emit "sendQuery2Response", message: "results from db", results: results
					do connection.close
					return
				return
		return
	return












	# 				socket.emit "socketnews", message: "results from db", results: results
	# 				console.log "socketnews", message: "results from db", results: results
	# 					socket.emit "socketnews", message: "Error executing to db", error: error
	# 					console.log "socketnews", message: "Error executing to db", error: error
	# 				socket.emit "socketnews", message: "Error connecting to db", error: error
	# 				console.log "socketnews", message: "Error connecting to db", error: error
	# 			socket.emit "socketnews", message: "connection to db established successfully", connection: connection
	# 			console.log "socketnews", message: "connection to db established successfully", connection: connection
	# 	socket.emit "socketnews", message: "query event has run", query: query
	# 	console.log "socketnews", message: "query event has run", query: query
	# socket.emit "socketnews", message: "socket connection established successfully"
	# console.log "socketnews", message: "socket connection established successfully"
		# 			if err then console.log "Error executing query:", error
		# 			console.log results
		# 			do connection.close




		# 		do connection.close
		# if error then console.log "Error connecting to db:", error
		# connection.execute "SELECT systimestamp FROM dual", [], (error, results) ->
		# 	if err then console.log "Error executing query:", error
		# 	console.log results
		# 	do connection.close
		# 	return
		# return



# oracle.connect(connectData, function(err, connection) {
#     if (err) { console.log("Error connecting to db:", err); return; }

#     connection.execute("SELECT systimestamp FROM dual", [], function(err, results) {
#         if (err) { console.log("Error executing query:", err); return; }

#         console.log(results);
#         connection.close(); // call only when query is finished executing
#     });
# });












			# connection.setAutoCommit yes
			# connection.setPrefetchRowCount count


			# if error then console.log "Error connecting to db:", error






	# socket.emit "news", hello: "world"
	# socket.on "my "

# io.sockets.on('connection', function (socket) {
#   socket.emit('news', { hello: 'world' });
#   socket.on('my other event', function (data) {
#     console.log(data);
#   });
# });



# oracle.connect
# 	hostname: "192.168.1.101"
# 	port: 1521
# 	database: "PDBORCL"
# 	user: "ticket_b2c"
# 	password: "qweqwe", (error, connection) ->





# 		if error then console.log "Error connecting to db:", error
# 		connection.execute "SELECT systimestamp FROM dual", [], (error, results) ->
# 			if err then console.log "Error executing query:", error
# 			console.log results
# 			do connection.close
# 			return
# 		return







# var io = require('socket.io').listen(80);
# var oracle = require('oracle-changed');
# io.sockets.on('connection', function (socket) {
#   socket.emit('news', { hello: 'world' });
#   socket.on('my other event', function (data) {
#     console.log(data);
#   });
# });

# var oracle = require('oracle');

# var connectData = {
#     hostname: "localhost",
#     port: 1521,
#     database: "xe", // System ID (SID)
#     user: "oracle",
#     password: "oracle"
# }

