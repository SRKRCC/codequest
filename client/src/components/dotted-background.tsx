import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "@/context/ThemeContext";

export function DottedBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    // Initialize engine once
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));

    setMounted(true);
  }, []);

  if (!mounted || !engineReady) return null;

  const isDarkMode = theme === "dark";

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 -z-10"
      options={{
        fullScreen: false,
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        detectRetina: true,
        particles: {
          number: {
            value: 100,
            density: { enable: true, height: 800, width: 800 },
          },
          color: { value: isDarkMode ? "#3b82f6" : "#1e293b" },
          shape: { type: "circle" },
          opacity: { value: 0.6 },
          size: { value: { min: 1, max: 2 } },
          move: {
            enable: true,
            speed: 0.5,
            direction: "none",
            outModes: "out",
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 100 },
            push: { quantity: 3 },
          },
        },
      }}
    />
  );
}
