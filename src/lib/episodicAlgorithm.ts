import raw from "@/data/bradley-episodic-consciousness-falls.json";

export type AlgorithmOption = {
  label: string;
  next: string;
};

export type DecisionNode = {
  id: string;
  type: "decision";
  question: string;
  options: AlgorithmOption[];
  source_pages: number[];
};

export type EndpointNode = {
  id: string;
  type: "diagnostic_endpoint";
  diagnosis_or_category: string;
  supporting_clues: string[];
  suggested_evaluation: string[];
  source_pages: number[];
};

export type AlgorithmNode = DecisionNode | EndpointNode;

export type EpisodicAlgorithm = {
  title: string;
  version: string;
  source: {
    book: string;
    chapters: { number: number; title: string; pdf_pages: string }[];
    publication_year: number;
  };
  scope: string;
  implementation: {
    entry_node: string;
    node_types: string[];
    navigation: string;
    multiple_diagnoses_possible: boolean;
    unknown_answers_allowed: boolean;
  };
  initial_assessment: {
    history: string[];
    examination: string[];
    safety_note: string;
  };
  nodes: AlgorithmNode[];
  comparative_features: Record<string, Record<string, string[]>>;
  clinical_cautions: string[];
};

export const episodicAlgorithm = raw as unknown as EpisodicAlgorithm;

export const getAlgorithmNode = (id: string): AlgorithmNode | undefined =>
  episodicAlgorithm.nodes.find((node) => node.id === id);

export const isEndpoint = (node: AlgorithmNode): node is EndpointNode =>
  node.type === "diagnostic_endpoint";

export const comparisonTitles: Record<string, string> = {
  syncope_vs_seizure: "Syncope vs seizure",
  absence_vs_focal_impaired_awareness: "Absence vs focal impaired-awareness seizure",
  functional_vs_epileptic: "Functional vs epileptic events",
};
