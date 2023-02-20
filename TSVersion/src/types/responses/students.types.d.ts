// tasks
export interface TaskResp {
    id: number,
    name: string,
    description: string,
    taskOrder: number,
    completed: boolean,
    thumbnail: string
}

export interface TaskIntroResp {
    id: number,
    name: string,
    description: string,
    taskOrder: number,
    thumbnailUrl: string,
    keywords: string[],
    longDescription: string
}

export interface TaskProgressResp {
    completed: boolean,
    blocked: boolean
}

// pretasks
export interface PretaskResp {
    description: string,
    keywords: string[],
    numQuestions: number,
    numLinks: number
}

export interface PretaskLinkResp {
    id: number,
    topic: string,
    url: string
}

export interface PretaskQuestionResp {
    id: number,
    content: string,
    type: string,
    imgAlt: string,
    imgUrl: string,
    options: {
        id: number,
        content: string,
        correct: boolean,
        feedback: string
    }[]
}

// duringtasks
export interface DuringtaskResp {
    description: string,
    keywords: string[],
    numQuestions: number
}

export interface DuringtaskQuestionResp {
    id: number,
    content: string,
    type: string,
    imgAlt: string,
    imgUrl: string,
    audioUrl: string,
    videoUrl: string,
    options: {
        id: number,
        content: string,
        correct: boolean,
        feedback: string
    }[]
}

// postasks
export interface PostaskResp {
    description: string,
    keywords: string[],
    numQuestions: number
}

export interface PostaskQuestionResp {
    id: number,
    content: string,
    type: string,
    imgAlt: string,
    imgUrl: string,
    audioUrl: string,
    videoUrl: string,
    options: {
        id: number,
        content: string,
        correct: boolean,
        feedback: string
    }[]
}

// teams
export interface TeamResp {
    id: number,
    code: string,
    name: string
}
