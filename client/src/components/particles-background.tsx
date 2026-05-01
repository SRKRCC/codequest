import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "@/context/ThemeContext";

export function ParticlesBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    // initialize tsparticles once
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
        fpsLimit: 120,
        detectRetina: true,
        particles: {
          number: {
            value: 80,
            density: { enable: true, width: 800, height: 800 },
          },
          color: { value: isDarkMode ? "#3b82f6" : "#ffffff" },
          links: {
            enable: true,
            color: isDarkMode ? "#3b82f6" : "#ffffff",
            distance: 150,
            opacity: isDarkMode ? 0.3 : 0.2,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: false,
            straight: false,
            outModes: { default: "bounce" },
          },
          opacity: { value: isDarkMode ? 0.5 : 0.3 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
      }}
    />
  );
}
