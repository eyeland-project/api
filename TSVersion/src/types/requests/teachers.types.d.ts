// courses
export interface CourseCreateReq {
    name: string,
    description: string
}

export interface CourseUpdateReq {
    name: string,
    description: string,
    session: boolean
}

// teams
export interface TeamCreateReq {
    name: string
}

export interface TeamUpdateReq {
    name: string,
    active: false
}
