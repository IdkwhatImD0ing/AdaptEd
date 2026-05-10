export type SlideImage = {
  src: string;
  description: string;
};

export type Slide = {
  title: string;
  template_id: number;
  images: SlideImage[];
  texts?: string[];
  speaker_notes?: string;
  image?: string;
};

export type Lecture = {
  title: string;
  description: string;
  slides: Slide[];
};

export type FunctionCall = {
  name: "next_slide" | "prev_slide" | "goto_slide" | "pause" | "resume";
  arguments?: Record<string, unknown>;
};

export type TranscriptEntry = {
  role: "agent" | "user";
  content: string;
  timestamp: number;
};
