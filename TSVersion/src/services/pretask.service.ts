import Links from '../models/Links';

export async function getAll(): Promise<any> {
    return await Links.findAll();
}

export async function getLinks(properties: any): Promise<any> {
    return await Links.findAll({where: properties});
}