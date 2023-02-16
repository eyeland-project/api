// tasks
export interface TaskResp {
    id: number,
    name: string,
    description: string,
    taskOrder: number,
    completed: boolean,
    thumbnail: string
}

export interface IntroductionResp {
    id: number,
    name: string,
    description: string,
    taskOrder: number,
    thumbnailUrl: string,
    keywords: string[],
    longDescription: string
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
    url: string,
    idTaskAttempt: number
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
    }[],
    idTaskAttempt: number
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
    }[],
    idTaskAttempt: number
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
    }[],
    idTaskAttempt: number
}
