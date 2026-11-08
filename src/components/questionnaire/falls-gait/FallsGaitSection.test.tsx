import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FallsGaitSection from "./FallsGaitSection";
import FallsAlgorithm from "./FallsAlgorithm";
import GaitAlgorithm from "./GaitAlgorithm";

describe("FallsGaitSection", () => {
  it("renders the STEADI fall risk screen", () => {
    render(<FallsGaitSection />);
    expect(screen.getByText("Falls screening")).toBeInTheDocument();
    expect(screen.getByText("Timed Up & Go")).toBeInTheDocument();
    expect(screen.getByText("30-second chair stand")).toBeInTheDocument();
    expect(screen.getByText("Gait observation")).toBeInTheDocument();
    expect(screen.getByText("Fall risk")).toBeInTheDocument();
  });

  it("links to the medication fall risk score", () => {
    render(<FallsGaitSection />);
    expect(screen.getByRole("button", { name: /medication risk \(mfrs\)/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /medication fall risk \(mfrs\)/i })).toBeInTheDocument();
  });

  it("switches between the falls and gait algorithms", () => {
    render(<FallsGaitSection />);

    fireEvent.mouseDown(screen.getByRole("tab", { name: /falls & drop attacks/i }));
    expect(
      screen.getByText("Falls and Drop Attacks: Neurological Evaluation")
    ).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("tab", { name: /gait evaluation/i }));
    expect(screen.getByText("Comprehensive Neurological Gait Evaluation")).toBeInTheDocument();
  });

  it("renders the first step of each algorithm", () => {
    const falls = render(<FallsAlgorithm />);
    expect(falls.getByText("Falls and Drop Attacks: Neurological Evaluation")).toBeInTheDocument();
    falls.unmount();

    const gait = render(<GaitAlgorithm />);
    expect(gait.getByText("Comprehensive Neurological Gait Evaluation")).toBeInTheDocument();
    expect(gait.getByText(/1\. Safety/)).toBeInTheDocument();
  });
});
