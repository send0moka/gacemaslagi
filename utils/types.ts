export interface Disease {
  id: number
  code: string
  name: string
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