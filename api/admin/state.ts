export let activeStory = "story1";
export let scores: any[] = [];

export const setActiveStory = (id: string) => {
  activeStory = id;
};

export const getActiveStory = () => activeStory;

export const setScores = (s: any[]) => {
  scores = s;
};

export const getScores = () => scores;
