const yts = require('yt-search');
const ytdl = require('ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');

// Contains { title, URL }
var song_queue = [];
// Key: guildID, Value: connection obj
var connections = new Map();

// Finds the first'th video on search terms. From ([String], int), returns a JSON: { title, URL }
async function findURL(args) {
    var video;
    if (args.length === 0) {
        return [null, 'Please use this command with search terms.'];
    } else if (ytdl.validateURL(args[0])) {
        const download = await ytdl.getInfo(args[0]);
        return [{ title: download.videoDetails.title, url: download.videoDetails.video_url }, null];
    } else {
        let query = await yts(args.join(' '));
        if (query) {
            return [{ title: query.videos[0].title, url: query.videos[0].url }, null];
        } else {
            return [null, 'No videos found on those keywords.'];
        }
    }
}

// Establishes a connection to a voice channel. From channel object, returns a connection object.
async function getConnection(voice_channel) {
    try {
        let discord_js_connection = joinVoiceChannel({
		    channelId: voice_channel.id,
		    guildId: voice_channel.guild.id,
		    adapterCreator: voice_channel.guild.voiceAdapterCreator,
	    });
		await entersState(discord_js_connection, VoiceConnectionStatus.Ready, 30e3);
        connections.set(voice_channel.guild.id, discord_js_connection);
		return discord_js_connection;
	} catch (error) {
		if (discord_js_connection) discord_js_connection.destroy();
		console.error(error);
        return;
	}
}

module.exports = {
    name: 'play',
    aliases: [/** Each alias should have it's own conditional. */],
    description: 'Manages queueing and playing of songs',
    async execute(message, args, rootcmd, client, Discord) {
        const guild_id = message.guild.id;
        const voice_channel = message.member.voice.channel;
        if (!voice_channel) return message.channel.send('You must be in a voice channel to use this command.');

        if (rootcmd === 'play') {            
            // Find a video on the args.
            let [video, err] = await findURL(args);
            // Push it to the queue.
            if (!err) song_queue.push(video);
            else {
                message.channel.send(err);
                return;
            }
            // If not connected in the user's guild, connect to the voice channel of the user who sent the message.
            if (connections.has(guild_id)) return;
            let connection = await getConnection(voice_channel);
            if (connection === null) return;
            // Subscribe the connection to a player.
            const player = createAudioPlayer();
            const subscription = connection.subscribe(player);
            while (song_queue.length != 0) {
                // Create an audio stream for the video.
                console.log('This shouldn\'t appear twice');
                let currentSong = song_queue.shift();
                let resourceStream = ytdl(currentSong.url, { filter: 'audioonly' });
                let resource = createAudioResource(resourceStream);
                player.play(resource);
                await entersState(player, AudioPlayerStatus.Playing, 5e3);
                message.channel.send(`${currentSong.title} is now playing.`);
                console.log(resourceStream);
                console.log(resource);
                try {
                    await entersState(player, AudioPlayerStatus.Idle, 100e3);
                } catch (err) {
                    console.log(err);
                }
            }
            subscription.unsubscribe();
            console.error('Unsubbed');
            connection.destroy();
            console.error('Destroyed');
            connections.delete(guild_id);
            console.error('Cleared');
        }
    }
}