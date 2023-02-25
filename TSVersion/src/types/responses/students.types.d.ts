// API
// auth
export interface LoginResp {
    token: string
}

// tasks
export interface TaskResp {
    id: number,
    name: string,
    description: string,
    taskOrder: number,
    completed: boolean,
    thumbnailUrl: string
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

interface ProgressBody {
    completed: boolean,
    blocked: boolean
}

export interface TaskProgressResp {
    pretask: ProgressBody,
    duringtask: ProgressBody,
    postask: ProgressBody
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
    name: string,
    students: {
        id: number,
        firstName: string,
        lastName: string,
        username: string,
        power: Power        
    }[]
}

// SOCKETS
export interface StudentSocket {
    id: number,
    firstName: string,
    lastName: string,
    username: string,
    power: Power        
}
