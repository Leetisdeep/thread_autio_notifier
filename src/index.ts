import { Client } from "discord.js-selfbot-v13";
import { config } from "dotenv";
import * as fs from 'fs';
import { join } from 'path';

// Yes require, so what
import { AudioContext } from 'node-web-audio-api';

// Initialize dotenv
config();

// Configuration
const SOUND_FILE: string = join(process.cwd(), 'sounds', 'notification.mp3');

const TARGET_GUILD_ID: string = process.env.TARGET_GUILD_ID || "SERVER_ID"; // Yes string
const TARGET_PARENT_ID: string = process.env.TARGET_PARENT_ID || "PARENT_ID"; // Parent is the channel thread is created at

// Function to play sound
async function playNotificationSound(): Promise<void> {
    try {
        const context = new AudioContext();
        const audioBuffer = await context.decodeAudioData(fs.readFileSync(SOUND_FILE).buffer);
        const source = context.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start();
        
        // Clean up after playback
        source.onended = () => {
            context.close();
        };
        
    } catch (error: any) {
        console.error(`Error playing sound: ${error.message}`);
    }
}

// Main execution
async function main(): Promise<void> {
    console.log('Starting sound notifier...');

    if (process.env.DISCORD_TOKEN) {
        const client: Client = new Client();
        
        client.on("threadCreate", async (thread) => {
            // If you want to play sound on specific Discord events too
            if (thread.guildId == TARGET_GUILD_ID && thread.parentId == TARGET_PARENT_ID) { // Yes you could check just for parent but that way should be faster
                playNotificationSound();
                console.log(`Sound played, ${thread.name}`);
            }
        });
        
        client.on("ready", () => {
            console.log(`Sound notifier ready - logged in as ${client.user?.tag}`);
        });
        
        await client.login(process.env.DISCORD_TOKEN);
    } else {
        console.log('No DISCORD_TOKEN provided, running in file-only mode');
    }
}

// Handle errors
process.on('unhandledRejection', (error: Error) => {
    console.error(`Unhandled promise rejection: ${error.message}`);
});

// Start the notifier
main().catch(console.error);