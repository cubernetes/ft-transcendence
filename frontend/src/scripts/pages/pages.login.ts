import { createHeader } from "../components/components.header";
import { createFooter } from "../components/components.footer";
import { createLoginForm } from "../components/components.loginForm";

export const createLoginPage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = await createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4";

    const loginButton = document.createElement("button");
    loginButton.className = "px-4 py-2 bg-blue-500 text-white rounded";
    loginButton.textContent = "Login";
    loginButton.onclick = async () => {
        const loginForm = await createLoginForm(loginButton);
        loginButton.replaceWith(loginForm);
    };
    main.appendChild(loginButton);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
