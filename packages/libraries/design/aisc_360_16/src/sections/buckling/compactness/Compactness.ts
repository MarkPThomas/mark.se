export enum eCompactness {
  compact,
  nonCompact,
  slender,
  tooSlender,
}

export interface ICompactnessCriteria {
  compactLimit(): number;
  nonCompactLimit(): number;
  slenderLimit(): number;

  compactness(): eCompactness;
}



