module.exports = {
    name: 'echo',
    aliases: ['e'],
    description: 'Argument tester. Echoes message.',
    execute(message, args, rootcmd, client, Discord) {
        let input = '';
        args.forEach(arg => {input + arg + ' '});
        message.channel.send(input);
        if (rootcmd === 'e') {
            message.channel.send('Alias \'e\' used.');
        }
    }
}