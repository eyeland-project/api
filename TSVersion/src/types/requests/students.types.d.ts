// answers
export interface AnswerOptionReq {
    answerSeconds: number,
    idOption: number,
    newAttempt?: boolean | null
}

export interface AnswerAudioReq {
    answerSeconds: number,
    audio1: string,
    audio2?: string | null
}
