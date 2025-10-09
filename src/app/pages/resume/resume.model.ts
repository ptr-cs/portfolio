export interface Resume {
  experience: {
    organization: string;
    role: string;
    location: string,
    duration: string;
    description: string;
  }[];
  publications: {
    organization: string;
    link: string;
    location: string,
    publicationDate: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    duration: string;
    location: string;
    description: string;
  }[];
  skills: string[];
  languages: string[];
}
