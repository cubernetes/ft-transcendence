import { createEl } from "../../utils/dom-helper";

export const createStarfield = (mainContainer: HTMLElement): HTMLCanvasElement => {
    const canvas = createEl(
        "canvas",
        "fixed top-0 left-0 w-full h-full block z-0 pointer-events-none"
    );
    const ctx = canvas.getContext("2d")!;
    let stars: Star[] = [];
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // 🎛️ Configurable Variables
    const numStars = 3000;
    const starMinSize = 1;
    const starMaxSize = 3;
    const starMinSpeed = 0.1;
    const starMaxSpeed = 3;
    const cursorImpactRadius = 200;
    const cursorImpactStrength = 20;
    const starTrailLength = 0.3; // the lower the value, the longer the trail

    type Star = {
        x: number;
        y: number;
        size: number;
        speed: number;
        color: string;
        direction: number;
    };

    const resize = () => {
        canvas.width = mainContainer.clientWidth;
        canvas.height = mainContainer.clientHeight;
    };
    resize();

    const initStars = () => {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * (starMaxSize - starMinSize) + starMinSize,
                speed: Math.random() * (starMaxSpeed - starMinSpeed) + starMinSpeed,
                color: `hsl(${Math.random() * 360}, 10%, 95%)`,
                direction: Math.random() < 0.5 ? 1 : -1,
            });
        }
    };
    initStars();

    let animationFrameId: number;
    const animate = () => {
        ctx.fillStyle = `rgba(0, 0, 0, ${starTrailLength})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let star of stars) {
            // Cursor interaction
            const dx = star.x - mouse.x;
            const dy = star.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < cursorImpactRadius) {
                const angle = Math.atan2(dy, dx);
                const force =
                    ((cursorImpactRadius - dist) / cursorImpactRadius) * cursorImpactStrength;
                star.x += Math.cos(angle + Math.PI / 2) * force; // orbit around
                star.y += Math.sin(angle + Math.PI / 2) * force;

                if (star.y < 0) star.y = 0;
                if (star.y > canvas.height) star.y = canvas.height;
            }

            // Move star
            star.x += star.speed * star.direction;
            if (star.x > canvas.width) star.x = 0;
            if (star.x < 0) star.x = canvas.width;

            // Draw star
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };

    const handleResize = () => {
        resize();
        initStars();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    canvas.addEventListener("destroy", () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(animationFrameId);
    });

    return canvas;
};
