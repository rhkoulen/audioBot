module.exports = {
    name: 'ping',
    description: 'Responsivity command.',
    execute(message, args, rootcmd, client, Discord) {
        message.channel.send('Pong!');
    }
}