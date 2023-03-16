export enum Power {
    SuperHearing = 'super_hearing',
    MemoryPro = 'memory_pro',
    SuperRadar = 'super_radar'
};

export enum IncommingEvents{
    Connection = 'connection',
    Disconnect = 'disconnect',
    Error = 'error',
    Join = 'join',
};

export enum OutgoingEvents{
    TEAM_UPDATE = 'team:student:update',
    TEAMS_UPDATE = 'teams:student:update',
    
    SESSION_CREATE = 'session:teacher:create',
    SESSION_END = 'session:teacher:end',
    SESSION_START = 'session:teacher:start',

    ANSWER = 'team:student:answer',
};