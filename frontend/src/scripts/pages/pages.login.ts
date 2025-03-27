import { createHeader } from "../components/components.header";
import { createFooter } from "../components/components.footer";
import { createLoginForm } from "../components/components.loginForm";

export const createLoginPage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = await createHeader();

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
