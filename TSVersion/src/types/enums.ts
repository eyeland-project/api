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
    TeamUpdate = 'team:student:update',
    TeamsUpdate = 'teams:student:update',
    
    SessionCreate = 'session:teacher:create',
    SessionEnd = 'session:teacher:end',
    SessionStart = 'session:teacher:start',

    Answer = 'team:student:answer',
};