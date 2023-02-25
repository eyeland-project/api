import { Power } from "../enums"

// auth
export interface LoginTeamReq {
    code: string,
    taskOrder: number
}

// teams
export interface PowerReq {
    power: Power
}

// answers
export interface AnswerOptionReq {
    answerSeconds: number,
    idOption: number,
    newAttempt?: boolean | null
}

export interface AnswerAudioReq {
    answerSeconds: number,
    audio: string,
    newAttempt?: boolean | null
}
