// teams
export interface TeamResp {
    id: number,
    code: string,
    name: string,
    active: boolean,
    students: {
        id: number,
        firstName: string,
        lastName: string,
        username: string,
        power: Power | null
    }[]
}
