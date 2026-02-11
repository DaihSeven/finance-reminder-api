import { prisma } from '../database/prisma';
import { User } from '../models/User';

export class UserRepository {
    async findByEmail (email:string): Promise<User | null > {
        return prisma.user.findUnique({ where: { email }})
    }

    async create(name: string, email: string, password: string): Promise<User> {
        return prisma.user.create({
            data: {
                name,
                email,
                password
            }
        })
    }
}