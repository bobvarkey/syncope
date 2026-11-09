import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import ApraxiaSection from "./ApraxiaSection";

const openTab = (name: RegExp) =>
  fireEvent.mouseDown(screen.getByRole("tab", { name }));

describe("ApraxiaSection", () => {
  it("renders the bedside praxis battery", () => {
    render(<ApraxiaSection />);
    expect(screen.getByText("Limb Apraxia Evaluation")).toBeInTheDocument();
    expect(screen.getByText("Pantomime to verbal command")).toBeInTheDocument();
    expect(screen.getByText("Imitate demonstrated gestures")).toBeInTheDocument();
    expect(screen.getByText("Assess limb kinetic movements")).toBeInTheDocument();
    expect(screen.getByText("Dominant abnormalities")).toBeInTheDocument();
  });

  it("records a hand finding without auto-diagnosing", () => {
    render(<ApraxiaSection />);
    const row = screen.getByRole("group", {
      name: "Pantomime to verbal command — Dominant hand",
    });
    fireEvent.click(within(row).getByRole("button", { name: "Abnormal" }));
    expect(screen.getByText("1 / 7")).toBeInTheDocument();
    expect(screen.queryByText(/candidate pattern/i)).not.toBeInTheDocument();
  });

  it("walks the decision tree to a candidate pattern", () => {
    render(<ApraxiaSection />);
    openTab(/decision tree/i);

    fireEvent.click(screen.getByRole("button", { name: /^yes$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));
    fireEvent.click(screen.getByRole("button", { name: /findings recorded/i }));
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^yes$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^yes$/i }));

    expect(screen.getByText("Ideomotor apraxia — parietal")).toBeInTheDocument();
    expect(
      screen.getByText(/Spatiotemporal gesture production errors with impaired gesture recognition/i)
    ).toBeInTheDocument();
    expect(screen.getByText("left inferior parietal lobule")).toBeInTheDocument();
  });

  it("shows the diagnostic profiles", () => {
    render(<ApraxiaSection />);
    openTab(/profiles/i);
    expect(screen.getByText("Ideational apraxia")).toBeInTheDocument();
    expect(
      screen.getByText(/Incorrect ordering of multistep actions despite preserved individual action knowledge/i)
    ).toBeInTheDocument();
    expect(screen.getByText("corpus callosum")).toBeInTheDocument();
  });

  it("shows interpretation rules and source caveats", () => {
    render(<ApraxiaSection />);
    openTab(/reference/i);
    expect(
      screen.getByText("Assess both upper extremities independently.")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Evidence for generalization and long-term maintenance is uncertain/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Neurology in Clinical Practice/i)).toBeInTheDocument();
  });
});
