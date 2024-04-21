type Image = {
    source: string;
    description: string;
  };

type Slide = {
    title: string;
    subtitle: string;
    template_id: number;
    images: Image[];
    texts: string[];
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
