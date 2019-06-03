var app = require("express")();
var http = require("http").createServer(app);
var db = require("./redis.js");
var io = require("socket.io")(http);

io.on("connection", function(socket) {
  console.log("a user connected");

  socket.on("join", async function(data) {
    try {
      let conference = JSON.parse(await db.get("room:" + data.room));
      socket.join(data.room);
      socket.conference_id = data.room;
      console.log(socket.id, " is joining room ", data.room);
      socket.emit("room_joined", {
        total_users: Object.keys(conference).length,
        total_comprendo: Object.keys(conference).reduce(function(sum, key) {
          sum += conference[key];
          return sum;
        }, 0)
      });
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("check_room", async function(data) {
    try {
      let reply = JSON.parse(await db.get("room:" + data.room));
      socket.emit("room_status", { is_available: !reply });
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("create_room", async function(data) {
    try {
      let exists = JSON.parse(await db.get("room:" + data.room));
      if (exists) {
        socket.emit("room_created", {
          success: false,
          message: "already_exists"
        });
      } else {
        await db.set("room:" + data.room, "{}");
        socket.emit("room_created", { success: true });
      }
    } catch (e) {
      console.error(e);
      socket.emit("room_created", { success: false, message: e.message });
    }
  });

  socket.on("set_admin", function(data) {
    socket.join(socket.conference_id + "_admin");
  });

  socket.on("vote", async function(data) {
    try {
      let conference = JSON.parse(await db.get(socket.conference_id));
      conference[socket.id] = data.value;
      await db.set(socket.conference_id, JSON.stringify(conference));
      io.to(socket.conference_id + "_admin").emit("update_votes", {
        total_users: Object.keys(conference).length,
        total_comprendo: Object.keys(conference).reduce(function(sum, key) {
          sum += conference[key];
          return sum;
        }, 0)
      });
      if (data.value === 0) {
        io.to(socket.conference_id + "_admin").emit("no_comprendo", {});
      }
    } catch (e) {
      console.error(e);
    }
  });
});

http.listen(8080, function() {
  console.log("listening on *8080");
});
