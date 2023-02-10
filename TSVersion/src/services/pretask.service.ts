import LinkModel from '../models/Link';

export async function getAll(): Promise<any> {
    return await LinkModel.findAll();
}

export async function getLinks(properties: any): Promise<any> {
    return await LinkModel.findAll({where: properties});
}