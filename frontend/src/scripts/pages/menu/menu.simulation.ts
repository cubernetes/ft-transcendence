import { createSimulation } from "../../components/components.simulation";

export const createSimulationPage = async (): Promise<HTMLElement> => {
    const page = document.createElement("div");

    const simulation = await createSimulation();
    page.appendChild(simulation);

    return page;
};
