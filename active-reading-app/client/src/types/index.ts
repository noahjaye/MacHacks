export interface IdeaNode {
  id: string;
  title: string;
  description: string;
  sourceText: string;
  userNotes?: string;
}

export interface IdeaEdge {
  from: string;
  to: string;
  relation: string;
}

export interface PaperAnalysis {
  uploadId: string;
  nodes: IdeaNode[];
  edges: IdeaEdge[];
}

export interface UploadResponse {
  uploadId: string;
  filename: string;
}

export interface AnalyzeResponse {
  uploadId: string;
  nodes: IdeaNode[];
  edges: IdeaEdge[];
}
