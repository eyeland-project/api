import Link from '../models/Link';

export async function getAll(): Promise<any> {
    return await Link.findAll();
}

export async function getLinks(properties: any): Promise<any> {
    return await Link.findAll({where: properties});
}