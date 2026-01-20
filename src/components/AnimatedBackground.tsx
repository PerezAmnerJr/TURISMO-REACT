import FloatingLines from "./FloatingLines";

export default function AnimatedBackground() {
  return (
    <FloatingLines
      linesGradient={["#E945F5", "#2F4BC0", "#E945F5"]}
      animationSpeed={1}
      interactive={true}
      parallax={true}
      parallaxStrength={0.2}
      background="#060010"
    />
  );
}
