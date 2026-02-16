const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Setting up the Bot with necessary permissions
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Using Environment Variables for Security
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

client.on('ready', () => {
    console.log(`Grime AI is live as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Ignore other bots or messages that don't mention your bot
    if (message.author.bot || !message.mentions.has(client.user)) return;

    try {
        // Typing indicator makes the bot feel real
        await message.channel.sendTyping();

        const userPrompt = message.content.replace(`<@${client.user.id}>`, "").trim();
        
        // Custom Grime System Instructions
        const systemInstruction = "You are the Grime Network AI. Your tone is elite, professional, and high-energy. Always use the clover emoji <:Clover:1472552247035691019> in your responses. Keep answers concise.";
        
        const result = await model.generateContent(`${systemInstruction}\n\nUser Question: ${userPrompt}`);
        const responseText = result.response.text();

        // Discord 2000 character safety check
        if (responseText.length > 2000) {
            message.reply(responseText.substring(0, 1900) + "... [Truncated]");
        } else {
            message.reply(responseText);
        }
    } catch (error) {
        console.error("Grime Error:", error);
        message.reply("⚠️ <:Clover:1472552247035691019> **GRIME SYSTEM ERROR:** Connection timed out.");
    }
});

client.login(process.env.BOT_TOKEN);
