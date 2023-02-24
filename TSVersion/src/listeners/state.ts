import { Socket } from "socket.io";

export const dirStudents = new Map<number, Socket>();
export const dirTeachers = new Map<number, Socket>();

export enum Namespace {
    STUDENTS = '/students',
    TEACHERS = '/teachers'
}
