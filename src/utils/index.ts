/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */

import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';


/**
 * A method that hashes the plain password supplied by the user.
 * @param plainPassword The plain password supplied by the user
 * @returns The user's database record if there is a user that matches the will be hashed password.
 */
export async function hashPassword(plainPassword: string, rounds: number) {
    return await bcrypt.hash(plainPassword, Number.parseInt(rounds.toString()));
}


/**
 * A method that compares the hashed password and the plain password provided.
 * @param plainTextPassword The plain password to hash and compare for verification.
 * @param hashedPassword The hashed password stored in the database
 */
export async function verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
) {
    const isPasswordMatching = await bcrypt.compare(
        plainTextPassword,
        hashedPassword,
    );
    if (!isPasswordMatching) {
        throw new HttpException(
            'Wrong credentials provided',
            HttpStatus.BAD_REQUEST,
        );
    }
}

export function makeID(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

export function getFileExtension(file_name: string) {
    const fileNameChunks = file_name.split(".")
    return fileNameChunks[fileNameChunks.length - 1]
}