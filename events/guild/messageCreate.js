module.exports = (Discord, client, message) => {
    const prefix = '-';
    // Register message in console (for debugging).
    console.log(`Message in: ${message}`);
    // Ignore message if self-created or not prefixed.
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    // Ignore prefix, delimit about ' '. Use first arg as command name.
    const args = message.content.slice(prefix.length).split(/ +/);
    const rootcmd = args.shift().toLowerCase();
    const command = client.commands.get(rootcmd) || client.commands.find(a => a.aliases && a.aliases.includes(rootcmd));
    if (command === undefined) {
        message.reply('Unrecognized command.');
        return;
    }
    try {
        command.execute(message, args, rootcmd, client, Discord);
    } catch (err) {
        message.reply("There was an error. Ping Chard.");
        console.log(err);
    }
}