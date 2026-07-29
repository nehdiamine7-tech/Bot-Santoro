const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// ==========================================
// CONFIGURATION SECTION
// ==========================================
const CONFIG = {
    WELCOME_CHANNEL_ID: '1520141030995791912',
    GOODBYE_CHANNEL_ID: '1531965467323924610',
    WELCOME_GIF_URL: 'https://media1.tenor.com/m/ZcQz_Bymg5cAAAAC/welcome.gif',
    WELCOME_MESSAGE: '**Welcome To The Family Santoro** {user}**!** **We Are Now** **__{memberCount}__** **Members**.',
    GOODBYE_MESSAGE: '{user} has left the server. We are now {memberCount} members.'
};

// ==========================================
// BOT INITIALIZATION
// ==========================================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildInvites
    ]
});

// ==========================================
// READY EVENT
// ==========================================
client.on('ready', () => {
    console.log(`Bot is online: ${client.user.tag}`);
    console.log(`Serving ${client.guilds.cache.size} servers`);
});

// ==========================================
// WELCOME SYSTEM (With GIF)
// ==========================================
client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(CONFIG.WELCOME_CHANNEL_ID);
    if (!channel) {
        console.error(`Welcome channel ${CONFIG.WELCOME_CHANNEL_ID} not found.`);
        return;
    }

    try {
        const welcomeText = CONFIG.WELCOME_MESSAGE
            .replace(/{user}/g, `<@${member.id}>`)
            .replace(/{memberCount}/g, member.guild.memberCount);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('👋 Welcome!')
            .setDescription(welcomeText)
            .setImage(CONFIG.WELCOME_GIF_URL)
            .setFooter({ text: `Member #${member.guild.memberCount}` })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error sending welcome message:', error);
    }
});

// ==========================================
// GOODBYE SYSTEM
// ==========================================
client.on('guildMemberRemove', async (member) => {
    const channel = member.guild.channels.cache.get(CONFIG.GOODBYE_CHANNEL_ID);
    if (!channel) {
        console.error(`Goodbye channel ${CONFIG.GOODBYE_CHANNEL_ID} not found.`);
        return;
    }

    try {
        const goodbyeText = CONFIG.GOODBYE_MESSAGE
            .replace(/{user}/g, member.user.tag)
            .replace(/{memberCount}/g, member.guild.memberCount);

        const embed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('👋 Goodbye!')
            .setDescription(goodbyeText)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({ text: `Member #${member.guild.memberCount}` })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error sending goodbye message:', error);
    }
});

// ==========================================
// MESSAGE COMMANDS
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // --------------------------------
    // AUTO RESPONDER (WITH RETURN)
    // --------------------------------
    if (message.content.toLowerCase().includes('tag')) {
        await message.reply('『ꜱɴᴛʀ』');
        return; // Stops here, so no other commands will run for this message
    }

    // --------------------------------
    // 1. !hello
    // --------------------------------
    if (message.content === '!hello') {
        await message.reply(`Hello ${message.author.username}!`);
    }

    // --------------------------------
    // 2. !ping
    // --------------------------------
    if (message.content === '!ping') {
        await message.reply(`Pong! ${Date.now() - message.createdTimestamp}ms`);
    }

    // --------------------------------
    // 3. !server (with Santoro Never Die)
    // --------------------------------
    if (message.content === '!server') {
        const guild = message.guild;
        const owner = guild.members.cache.get(guild.ownerId);
        const ownerMention = owner ? `<@${owner.id}>` : 'Unknown';
        const totalRoles = guild.roles.cache.size - 1;
        const totalChannels = guild.channels.cache.size;
        const totalMembers = guild.members.cache.filter(m => !m.user.bot).size;
        const totalBots = guild.members.cache.filter(m => m.user.bot).size;

        const embed = {
            color: 0x00ff00,
            title: `📊 Server Info: ${guild.name}`,
            thumbnail: { url: guild.iconURL({ dynamic: true }) || null },
            fields: [
                { name: '👑 Owner', value: ownerMention, inline: true },
                { name: '📜 Roles', value: `${totalRoles}`, inline: true },
                { name: '📁 Channels', value: `${totalChannels}`, inline: true },
                { name: '👥 Humans', value: `${totalMembers}`, inline: true },
                { name: '🤖 Bots', value: `${totalBots}`, inline: true },
                { name: '🏷️ Total Members', value: `${guild.memberCount}`, inline: true },
            ],
            footer: { text: 'Santoro Never Die' },
            timestamp: new Date()
        };
        await message.reply({ embeds: [embed] });
    }

    // --------------------------------
    // 4. !commands
    // --------------------------------
    if (message.content === '!commands') {
        await message.reply(
            'Commands:\n' +
            '!hello, !ping, !server, !commands\n' +
            '!kick @user [reason]\n' +
            '!ban @user [reason]\n' +
            '!timeout @user [minutes] [reason]\n' +
            '!clear [number]\n' +
            '!announce [#channel] [@everyone/@here/@role] [image_url] [text]\n' +
            '!giverole @user @role\n' +
            '!giveroleall @role\n' +
            '!invites\n\n' +
            '**Auto Systems:** Welcome (with GIF) & Goodbye messages are active.\n' +
            '**Auto Responder:** Sending "tag" replies with 『ꜱɴᴛʀ』'
        );
    }

    // --------------------------------
    // 5. !kick
    // --------------------------------
    if (message.content.startsWith('!kick')) {
        if (!message.member.permissions.has('KickMembers')) {
            return message.reply('You need KickMembers permission.');
        }
        const args = message.content.split(' ');
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention a user. Example: !kick @user reason');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('User not found.');
        if (!member.kickable) return message.reply('I cannot kick this user (higher role).');
        const reason = args.slice(2).join(' ') || 'No reason';
        await member.kick(reason);
        await message.reply(`✅ ${user.tag} kicked. Reason: ${reason}`);
    }

    // --------------------------------
    // 6. !ban
    // --------------------------------
    if (message.content.startsWith('!ban')) {
        if (!message.member.permissions.has('BanMembers')) {
            return message.reply('You need BanMembers permission.');
        }
        const args = message.content.split(' ');
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention a user. Example: !ban @user reason');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('User not found.');
        if (!member.bannable) return message.reply('I cannot ban this user (higher role).');
        const reason = args.slice(2).join(' ') || 'No reason';
        await member.ban({ reason: reason });
        await message.reply(`✅ ${user.tag} banned. Reason: ${reason}`);
    }

    // --------------------------------
    // 7. !timeout
    // --------------------------------
    if (message.content.startsWith('!timeout')) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('You need ModerateMembers permission.');
        }
        const args = message.content.split(' ');
        const user = message.mentions.users.first();
        if (!user) return message.reply('Mention a user. Example: !timeout @user 10 spamming');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('User not found.');
        if (!member.moderatable) return message.reply('I cannot timeout this user (higher role).');
        const minutes = parseInt(args[2]);
        if (!minutes || isNaN(minutes) || minutes <= 0) {
            return message.reply('Provide a valid number of minutes. Example: !timeout @user 10');
        }
        if (minutes > 40320) return message.reply('Maximum timeout is 40320 minutes (28 days).');
        const reason = args.slice(3).join(' ') || 'No reason';
        const ms = minutes * 60 * 1000;
        await member.timeout(ms, reason);
        await message.reply(`✅ ${user.tag} timed out for ${minutes} minutes. Reason: ${reason}`);
    }

    // --------------------------------
    // 8. !clear
    // --------------------------------
    if (message.content.startsWith('!clear')) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('You need ManageMessages permission.');
        }
        const args = message.content.split(' ');
        const amount = parseInt(args[1]);
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply('Provide a number. Example: !clear 10');
        }
        if (amount > 100) return message.reply('Max 100 messages at once.');
        try {
            await message.delete();
            const msgs = await message.channel.messages.fetch({ limit: amount });
            const deleted = await message.channel.bulkDelete(msgs, true);
            const reply = await message.channel.send(`✅ Deleted ${deleted.size} messages.`);
            setTimeout(() => reply.delete(), 5000);
        } catch (err) {
            console.error(err);
            await message.channel.send('❌ Failed. Messages might be older than 14 days.');
        }
    }

    // --------------------------------
    // 9. !announce
    // --------------------------------
    if (message.content.startsWith('!announce')) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply('You need ManageMessages permission.');
        }

        const args = message.content.split(' ');
        args.shift();

        let targetChannel = message.channel;
        let mentionString = '';
        let imageUrl = null;
        let textParts = [];

        const attachment = message.attachments.first();
        if (attachment) {
            imageUrl = attachment.url;
        }

        for (const arg of args) {
            if (arg.startsWith('<#') && arg.endsWith('>')) {
                const channelId = arg.replace(/[<#>]/g, '');
                const channel = message.guild.channels.cache.get(channelId);
                if (channel && channel.isTextBased()) {
                    targetChannel = channel;
                    continue;
                }
            }
            if (arg === '@everyone' || arg === '@here') {
                mentionString = arg + ' ';
                continue;
            }
            if (arg.startsWith('<@&') && arg.endsWith('>')) {
                mentionString = arg + ' ';
                continue;
            }
            if (arg.startsWith('http') && (arg.includes('.png') || arg.includes('.jpg') || arg.includes('.jpeg') || arg.includes('.gif') || arg.includes('.webp'))) {
                imageUrl = arg;
                continue;
            }
            textParts.push(arg);
        }

        const text = textParts.join(' ');
        if (!text) {
            return message.reply('Please provide announcement text. Example: !announce #general @everyone https://img.com/pic.png Hello world!');
        }

        await message.delete();

        const embed = {
            color: 0x00ff00,
            title: '📢 ANNOUNCEMENT',
            description: text,
            footer: { text: `Sent by ${message.author.username}` },
            timestamp: new Date()
        };
        if (imageUrl) {
            embed.image = { url: imageUrl };
        }

        await targetChannel.send({
            content: mentionString,
            embeds: [embed]
        });
    }

    // --------------------------------
    // 10. !giverole (Single user)
    // --------------------------------
    if (message.content.startsWith('!giverole')) {
        if (!message.member.permissions.has('ManageRoles')) {
            return message.reply('You need ManageRoles permission.');
        }
        const args = message.content.split(' ');
        const userMention = args[1];
        const roleMention = args[2];
        if (!userMention || !roleMention) {
            return message.reply('Usage: !giverole @user @role');
        }
        const user = message.mentions.users.first();
        if (!user) return message.reply('Invalid user.');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return message.reply('User not found.');

        const role = message.mentions.roles.first();
        if (!role) return message.reply('Invalid role. Mention a role.');
        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.reply('Bot lacks ManageRoles permission.');
        }
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('Bot role is lower than that role. Cannot assign.');
        }

        try {
            await member.roles.add(role);
            await message.reply(`✅ ${user.tag} got role ${role.name}.`);
        } catch (err) {
            console.error(err);
            await message.reply('❌ Failed to assign role.');
        }
    }

    // --------------------------------
    // 11. !giveroleall (Simple version)
    // --------------------------------
    if (message.content.startsWith('!giveroleall')) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('You need Administrator permission.');
        }

        const args = message.content.split(' ');
        const roleMention = args[1];
        if (!roleMention) return message.reply('Usage: !giveroleall @role');

        const role = message.mentions.roles.first();
        if (!role) return message.reply('Invalid role. Mention a valid role.');

        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.reply('Bot lacks ManageRoles permission.');
        }
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply('Bot role is lower than that role. Cannot assign.');
        }

        const members = message.guild.members.cache.filter(m => !m.user.bot && !m.roles.cache.has(role.id));
        if (members.size === 0) return message.reply('Everyone already has that role.');

        await message.reply(`⏳ Adding role to ${members.size} members...`);

        let count = 0;
        for (const [id, member] of members) {
            try {
                await member.roles.add(role);
                count++;
            } catch (err) {
                console.error(`Failed for ${member.user.tag}: ${err}`);
            }
        }

        await message.channel.send(`✅ Done! Added role to ${count} members.`);
    }

    // --------------------------------
    // 12. !invites
    // --------------------------------
    if (message.content === '!invites') {
        if (!message.guild.members.me.permissions.has('ManageGuild')) {
            return message.reply('Bot needs ManageGuild permission to view invites.');
        }
        try {
            const invites = await message.guild.invites.fetch();
            const sorted = invites.sort((a, b) => b.uses - a.uses).first(5);

            if (sorted.length === 0) {
                return message.reply('No invites found in this server.');
            }

            let response = '🏆 **Top Invites** 🏆\n';
            sorted.forEach((inv, i) => {
                response += `**${i + 1}.** ${inv.inviter ? inv.inviter.tag : 'Unknown'} -> **${inv.uses}** uses (Code: ${inv.code})\n`;
            });
            await message.reply(response);
        } catch (err) {
            console.error(err);
            await message.reply('❌ Failed to fetch invites. Ensure bot has ManageGuild permission.');
        }
    }
});

// ==========================================
// LOGIN USING ENVIRONMENT VARIABLE
// ==========================================
client.login(process.env.TOKEN);
