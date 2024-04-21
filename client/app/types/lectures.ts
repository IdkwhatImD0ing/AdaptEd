type Image = {
    src: string;
    description: string;
  };

type Slide = {
    title: string;
    template_id: number;
    images: Image[];
    texts?: string[];
    speaker_notes?: string;
    image?: string;
};

type Lecture = {
    title: string;
    description: string;
    slides: Slide[];
};

type GeneratedLectures = {
    email: string;
    lectures: Lecture[];
};
