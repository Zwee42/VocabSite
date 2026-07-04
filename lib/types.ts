export interface User {
  id: number;
  username: string;
}

export interface VocabSet {
  id: number;
  user_id: number;
  name: string;
  source_lang: string;
  target_lang: string;
  times_trained: number;
  created_at: string;
  words?: Word[];
  username?: string;
}

export interface Word {
  id: number;
  set_id: number;
  source: string;
  target: string;
}
