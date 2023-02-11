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
    message: string,
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
    message: string,
    numQuestions: number
}

export interface DuringQuestionResp {
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

// postasks
export interface PostaskResp {
    message: string,
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
