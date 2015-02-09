ip = location.hostname
MB = {}
MB.User = {}
MB.User.socket2 = io.connect "http://#{ip}:8080"
MB.User.socket2.on "connect", (data) ->
	console.log data
MB.User.socket2.on "socketnews", (data) ->
	console.log data
MB.User.socket2.on "sendQuery2Response", (data) ->
	console.log data