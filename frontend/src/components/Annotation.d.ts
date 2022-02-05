export interface Segment {
    id: number;
    start: number;
    end: number;
    subtitle: string;
}

export interface IAnnotate {
    annote: Segment[]
}