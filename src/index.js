require("dotenv").config();

const ytdl = require("discord-ytdl-core");
const { Client } = require("discord.js");
const client = new Client();

const prefix = ".";

client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on("ready", () => {
  console.log("ready");
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  const args = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  //play youtube video
  if (command == "play") {
    if (!args[0]) return;
    let url = args.join(" ");
    let vc = msg.member.voice.channel;
    if (!vc) return msg.channel.send("Join a voice channel");
    if (!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) {
      msg.channel.send("Invalid Youtube Link");
    } else {
      let stream = ytdl(url, {
        filter: "audioonly",
        opusEncoded: true,
        encoderArgs: ["-af", "bass=g=10,dynaudnorm=f=200"],
      });
      try {
        msg.member.voice.channel.join().then((connection) => {
          let dispatcher = connection
            .play(stream, {
              type: "opus",
              quality: "highestaudio",
              highWaterMark: 1 << 25,
            })
            .on("finish", () => {
              msg.guild.me.voice.channel.leave();
              return msg.channel.send("Finished playing");
            });
        });
        return msg.channel.send("Playing " + url);
      } catch (error) {
        console.log(error);
        return msg.channel.send(
          "There was an error playing the song! Error: " + error
        );
      }
    }
  }

  //disconnect bot from channel
  if (command == "stop") {
    console.log("leave");
    try {
      msg.guild.me.voice.channel.leave();
      return msg.channel.send("Stopped");
    } catch (error) {
      console.log(error);
    }
  }
});
