import { createEl } from "../../utils/dom-helper";

/**
 * @default tw "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400"
 */
export const createButton = (
    text: string,
    tw: string = "",
    click?: () => void
): HTMLButtonElement => {
    // Base tailwindCSS to apply on all button elements, can be replaced by appending
    const baseTw = "rounded text-xl text-black p-2 bg-gray-100 hover:bg-gray-400";

    const fullTw = `${baseTw} ${tw}`;
    const button = createEl("button", fullTw, { text });

    if (click) {
        button.onclick = click;
    }

    return button;
};

/**
 * 

    returnButton.className =
        "absolute top-8 left-8 p-2 bg-gray-400 text-black rounded text-xl hover:bg-gray-600";

    createLobbyButton.className = "w-64 p-4 bg-red-500 text-white rounded text-xl hover:bg-red-700";
    playButton.className =
        "mt-8 p-4 bg-red-500 text-white rounded text-2xl hover:bg-red-600 w-full";

    joinLobbyButton.className =
        "w-64 p-4 bg-green-500 text-white rounded text-xl hover:bg-green-700";

    returnButton.className =
        "absolute top-8 left-8 p-2 bg-gray-400 text-black rounded text-xl hover:bg-gray-600";
    returnButton.innerHTML = "&#8617;";

    easyButton.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";


    mediumButton.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";


    hardButton.className = "p-2 bg-gray-100 text-black rounded hover:bg-gray-400 text-xl";


    logoutBtn.className =
        "ml-4 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded focus:outline-none";

 */
