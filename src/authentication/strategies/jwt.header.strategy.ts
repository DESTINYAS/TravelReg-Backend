/* eslint-disable prettier/prettier */
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import TokenPayload from "../tokenPayload.interface";
import { UsersService } from '../../user/users.service';

@Injectable()
export class JWTFromAuthHeaderStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET')
        })
    }

    async validate(payload: TokenPayload) {
        const user = await this.userService.getById(payload.userId)
        return user
    }
}