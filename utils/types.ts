export interface Disease {
  id: number
  code: string
  name: string
  about: string
  solution: {
    desc: string
    image: string | null
    list: string | null
    link: string | null
  }
  symptoms: number[]
  created_at: string
}

export interface Symptom {
  description: string
  image: string
  id: number
  code: string
  name: string
}

export interface FileWithPreview extends File {
  preview?: string
}

export interface LexicalNode {
  children?: {
    text: string
  }[]
}

export interface DecisionNode {
  id: number
  node_id: string
  node_type: 'symptom' | 'disease'
  parent_id: number | null
  is_yes_path: boolean | null
  children?: {
    yes: DecisionNode | null
    no: DecisionNode | null
  }
}

export interface Diagnosis {
  id: string
  user_id: string
  symptoms: string[]
  disease_code: string
  created_at: string
  email: string | null
}

export interface Article {
  id: string
  title: string
  subtitle: string
  content: string
  cover_image: string
  author_id: string
  created_at: string
  likes_count: number
}

export interface ArticleComment {
  id: string
  article_id: string
  email: string
  content: string
  created_at: string
}

export interface ArticleLike {
  id: string
  article_id: string
  user_id: string
  created_at: string
}