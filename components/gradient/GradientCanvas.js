import { useEffect, useRef } from "react";
import { Gradient } from "./Gradient";
import styles from "./GradientCanvas.module.css";

const GradientCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const gradient = new Gradient();
    gradient.initGradient("#gradient-canvas");

    return () => {
      // Clean up if necessary
    };
  }, []);

  return (
    <canvas
      id="gradient-canvas"
      ref={canvasRef}
      data-transition-in
      className={styles.gradientCanvas}
    />
  );
};

export default GradientCanvas;
