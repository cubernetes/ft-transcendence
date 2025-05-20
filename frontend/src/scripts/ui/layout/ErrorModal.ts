import { createModal } from "../components/Modal";
import { createParagraph } from "../components/Paragraph";

// TODO: switch to error code if ever user-facing
export const createErrorModal = (error: string) => {
    const errorEl = createParagraph({ text: `Error: ${error}`, tw: "text-red-400 m-4" });

    createModal({ children: [errorEl] });
};
