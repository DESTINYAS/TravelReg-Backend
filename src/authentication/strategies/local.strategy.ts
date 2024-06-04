/* eslint-disable prettier/prettier */
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

import { AuthenticationService } from "../authentication.service";
import User from "../../user/entities/user.entity";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authenticationService: AuthenticationService) {
        super({ usernameField: 'phoneNumber' })
    }

    async validate(phoneNumber: string, password: string): Promise<User> {
        const user = await this.authenticationService.getAuthenticatedUser(phoneNumber, password)
        return user
    }
}