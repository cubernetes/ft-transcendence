import { createHeader } from "../components/Header";
import { createFooter } from "../components/Footer";
import { createLoginForm } from "../components/LoginForm";

export const createLoginPage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4";

    const loginForm = await createLoginForm();
    main.appendChild(loginForm);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
