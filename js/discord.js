const DISCORD_USERNAME = "eccemars";
const DISCORD_COPY_MESSAGE = `Hey! You got my Discord username (${DISCORD_USERNAME})!\n` + `Send me a friend request there. 💖`;

document.addEventListener("DOMContentLoaded", () => {
    const discordLink = document.querySelector("[data-action='copy-discord']");

    if (!discordLink) return;

    discordLink.addEventListener("click", (event) => {
        event.preventDefault();

        navigator.clipboard.writeText(DISCORD_USERNAME)
            .then(() => alert(DISCORD_COPY_MESSAGE))
            .catch((error) => console.error("Clipboard copy failed:", error));
    });
});