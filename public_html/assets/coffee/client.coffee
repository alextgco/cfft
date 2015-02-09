ip = location.hostname
@.socket2 = io.connect "http://#{ip}:8080"
@.socket2.on "connect", (data) ->
	console.log data
@.socket2.on "socketnews", (data) ->
	console.log data
@.socket2.on "sendQuery2Response", (data) ->
	console.log data

# ip = location.hostname
# @ = window
# @.socket2 = io.connect "http://#{ip}:8080"
# @.socket2.on "connect", (data) ->
# 	console.log data
# @.socket2.on "socketnews", (data) ->
# 	console.log data
# @.socket2.on "sendQuery2Response", (data) ->
# 	console.log data