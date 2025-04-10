import { PongEngine } from "@darrenkuro/pong-core";
import { sendGameAction } from "../ws/ws.service";

export const createGameEventController = (engine: PongEngine) => {
    const handleKeydownEventLocal = (evt: KeyboardEvent, engine: PongEngine) => {
        if (evt.key === "w") {
            engine.setInput(0, "up");
        } else if (evt.key === "s") {
            engine.setInput(0, "down");
        } else if (evt.key === "ArrowUp") {
            engine.setInput(1, "up");
        } else if (evt.key === "ArrowDown") {
            engine.setInput(1, "down");
        }
    };

    const handleKeyupEventLocal = (evt: KeyboardEvent, engine: PongEngine) => {
        window.log.debug(`Key released: ${evt.key}`);
        if (["w", "s"].includes(evt.key)) {
            engine.setInput(0, "stop");
        } else if (["ArrowUp", "ArrowDown"].includes(evt.key)) {
            engine.setInput(1, "stop");
        }
    };

    const handleKeydownLocal = (evt: KeyboardEvent) => {
        handleKeydownEventLocal(evt, engine);
    };

    const handleKeyupLocal = (evt: KeyboardEvent) => {
        handleKeyupEventLocal(evt, engine);
    };

    const handleKeydownEventAi = (evt: KeyboardEvent, engine: PongEngine) => {
        if (evt.key === "w" || evt.key === "ArrowUp") {
            engine.setInput(0, "up");
        } else if (evt.key === "s" || evt.key === "ArrowDown") {
            engine.setInput(0, "down");
        }
    };

    const handleKeyupEventAi = (evt: KeyboardEvent, engine: PongEngine) => {
        if (["w", "s", "ArrowUp", "ArrowDown"].includes(evt.key)) {
            engine.setInput(0, "stop");
        }
    };

    const handleKeydownAi = (evt: KeyboardEvent) => {
        handleKeydownEventAi(evt, engine);
    };

    const handleKeyupAi = (evt: KeyboardEvent) => {
        handleKeyupEventAi(evt, engine);
    };

    const handleKeydownOnline = (evt: KeyboardEvent) => {
        if (evt.key === "w" || evt.key === "ArrowUp") {
            sendGameAction("up");
        } else if (evt.key === "s" || evt.key === "ArrowDown") {
            sendGameAction("down");
        }
    };

    const handleKeyupOnline = (evt: KeyboardEvent) => {
        if (["w", "s", "ArrowUp", "ArrowDown"].includes(evt.key)) {
            sendGameAction("stop");
        }
    };

    const attachLocalControl = () => {
        document.addEventListener("keydown", handleKeydownLocal);
        document.addEventListener("keyup", handleKeyupLocal);
    };

    const detachLocalControl = () => {
        document.removeEventListener("keydown", handleKeydownLocal);
        document.removeEventListener("keyup", handleKeyupLocal);
    };

    const attachOnlineControl = () => {
        document.addEventListener("keydown", handleKeydownOnline);
        document.addEventListener("keyup", handleKeyupOnline);
    };

    const detachOnlineControl = () => {
        document.removeEventListener("keydown", handleKeydownOnline);
        document.removeEventListener("keyup", handleKeyupOnline);
    };

    const attachAiControl = () => {
        document.addEventListener("keydown", handleKeydownAi);
        document.addEventListener("keyup", handleKeyupAi);
    };

    const detachAiControl = () => {
        document.removeEventListener("keydown", handleKeydownAi);
        document.removeEventListener("keyup", handleKeyupAi);
    };

    /** Detach all event controllers because it is safe to remove ones that don't exist */
    const detachAllControls = () => {
        detachLocalControl();
        detachOnlineControl();
        detachAiControl();
    };

    return {
        attachLocalControl,
        attachOnlineControl,
        attachAiControl,
        detachAllControls,
    };
};
