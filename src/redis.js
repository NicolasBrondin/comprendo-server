var redis = require("redis"),
  client = redis.createClient({
    url:
      "redis://h:p49789d1900284428368ebb5556c5555bb842bec0ef04abfdb6f449e17a74b52e@ec2-108-129-53-202.eu-west-1.compute.amazonaws.com:28969"
  });

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function(err) {
  console.log("Error " + err);
});
/*
client.set("string key", "string val", redis.print);
client.hset("hash key", "hashtest 1", "some value", redis.print);
client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
client.hkeys("hash key", function (err, replies) {
    console.log(replies.length + " replies:");
    replies.forEach(function (reply, i) {
        console.log("    " + i + ": " + reply);
    });
    client.quit();
});*/

module.exports = client;
