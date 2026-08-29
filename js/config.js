/*
 * Agentic Among Us — Main Menu Configuration
 */

const CHARACTER_COLORS = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Pink",
    "Orange",
    "Purple",
    "Cyan",
    "White",
    "Brown"
];

const DEFAULT_PLAYERS = [
    { name: "Player 1", model: "gpt-4o", color: "Red" },
    { name: "Player 2", model: "claude-3.5-sonnet", color: "Blue" },
    { name: "Player 3", model: "deepseek-v3", color: "Green" },
    { name: "Player 4", model: "gemini-2.0-flash", color: "Yellow" }
];

let GAME_CONFIG = {
    apiKeys: {
        openRouter: "",
        fishAudio: ""
    },
    players: [],
    started: false
};

window.GAME_CONFIG = GAME_CONFIG;

function createMainMenu() {
    const menu = document.getElementById("main-menu");

    if (!menu) {
        console.error("Main menu container #main-menu was not found.");
        return;
    }

    menu.innerHTML = `
        <div class="config-panel">
            <h1>AGENTIC AMONG US</h1>

            <section class="api-section">
                <h2>API Configuration</h2>

                <label>
                    OpenRouter / OpenAI API Key
                    <input
                        id="openrouter-api-key"
                        type="password"
                        placeholder="Enter API key"
                        autocomplete="off"
                    >
                </label>

                <label>
                    Fish Audio API Key
                    <input
                        id="fish-audio-api-key"
                        type="password"
                        placeholder="Enter API key"
                        autocomplete="off"
                    >
                </label>
            </section>

            <section class="roster-section">
                <h2>AI Roster</h2>

                <label>
                    Number of Players
                    <select id="player-count">
                        ${Array.from({ length: 7 }, (_, i) => {
                            const count = i + 4;
                            return `<option value="${count}" ${count === 4 ? "selected" : ""}>${count}</option>`;
                        }).join("")}
                    </select>
                </label>

                <div id="roster-container"></div>
            </section>

            <button id="start-game-btn" type="button">
                START GAME
            </button>

            <p id="config-error" role="alert"></p>
        </div>
    `;

    document
        .getElementById("player-count")
        .addEventListener("change", event => {
            renderRoster(Number(event.target.value));
        });

    document
        .getElementById("start-game-btn")
        .addEventListener("click", startConfiguredGame);

    renderRoster(4);
}

function renderRoster(count) {
    const container = document.getElementById("roster-container");

    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const defaultPlayer = DEFAULT_PLAYERS[i] || {
            name: `Player ${i + 1}`,
            model: "",
            color: CHARACTER_COLORS[i % CHARACTER_COLORS.length]
        };

        const playerRow = document.createElement("div");

        playerRow.className = "roster-player";
        playerRow.dataset.playerIndex = i;

        playerRow.innerHTML = `
            <h3>Player ${i + 1}</h3>

            <label>
                Player Name
                <input
                    class="player-name"
                    type="text"
                    value="${escapeHtml(defaultPlayer.name)}"
                    maxlength="24"
                    placeholder="Enter player name"
                >
            </label>

            <label>
                LLM Model
                <input
                    class="player-model"
                    type="text"
                    value="${escapeHtml(defaultPlayer.model)}"
                    placeholder="e.g. gpt-4o, claude-3.5-sonnet, deepseek-v3"
                    autocomplete="off"
                >
            </label>

            <label>
                Character Color
                <select class="player-color">
                    ${CHARACTER_COLORS.map(color => `
                        <option value="${color}" ${
                            color === defaultPlayer.color ? "selected" : ""
                        }>
                            ${color}
                        </option>
                    `).join("")}
                </select>
            </label>
        `;

        container.appendChild(playerRow);
    }
}

function assignSecretRoles(players) {
    if (players.length < 4) {
        throw new Error("A game requires at least 4 players.");
    }

    const impostorIndex = Math.floor(Math.random() * players.length);

    return players.map((player, index) => ({
        ...player,
        role: index === impostorIndex ? "impostor" : "crewmate"
    }));
}

function collectRoster() {
    const rows = document.querySelectorAll(".roster-player");

    return Array.from(rows).map((row, index) => {
        const name =
            row.querySelector(".player-name")?.value.trim() ||
            `Player ${index + 1}`;

        const model =
            row.querySelector(".player-model")?.value.trim();

        const color =
            row.querySelector(".player-color")?.value;

        if (!model) {
            throw new Error(`Please enter an LLM model for Player ${index + 1}.`);
        }

        return {
            id: `player-${index + 1}`,
            name,
            model,
            color
        };
    });
}

function startConfiguredGame() {
    const errorBox = document.getElementById("config-error");

    try {
        const openRouterKey =
            document.getElementById("openrouter-api-key")?.value.trim() || "";

        const fishAudioKey =
            document.getElementById("fish-audio-api-key")?.value.trim() || "";

        const players = collectRoster();

        if (players.length < 4 || players.length > 10) {
            throw new Error("Player count must be between 4 and 10.");
        }

        const colors = players.map(player => player.color);

        if (new Set(colors).size !== colors.length) {
            throw new Error("Each player must have a different character color.");
        }

        GAME_CONFIG = {
            apiKeys: {
                openRouter: openRouterKey,
                fishAudio: fishAudioKey
            },

            players: assignSecretRoles(players),

            started: true
        };

        window.GAME_CONFIG = GAME_CONFIG;

        document.getElementById("main-menu").style.display = "none";

        if (typeof window.startGame === "function") {
            window.startGame(GAME_CONFIG);
        } else if (typeof window.initGame === "function") {
            window.initGame(GAME_CONFIG);
        } else {
            throw new Error(
                "game.js is loaded, but startGame() or initGame() was not found."
            );
        }

    } catch (error) {
        console.error("Game configuration error:", error);

        if (errorBox) {
            errorBox.textContent = error.message;
        }
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

window.createMainMenu = createMainMenu;
window.assignSecretRoles = assignSecretRoles;
window.startConfiguredGame = startConfiguredGame;

document.addEventListener("DOMContentLoaded", createMainMenu);
