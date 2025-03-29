export const createFooter = (): HTMLElement => {
    const footer = document.createElement("footer");
    footer.className = "bg-gray-200 p-4 text-center font-medieval";

    const text = document.createElement("p");
    text.textContent = "© 2025 ft-transcendence";

    footer.appendChild(text);
    return footer;
};
