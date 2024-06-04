/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { CanActivate, ExecutionContext, mixin, Type } from "@nestjs/common";
import RequestWithUser from "../requestWithUser.interface";
import JwtAuthenticationGuard from "./jwt-authentication.guard";

/**
 * A guard that checks if the user's role equate to the given one 
 * or checks if the user id matches the one in the url
 * @param role 
 * @returns 
 */
const IsActiveWithJWTAuthenticationGuard = (): Type<CanActivate> => {
    class IsActiveMixin extends JwtAuthenticationGuard {
        async canActivate(context: ExecutionContext) {
            await super.canActivate(context);
            const request = context.switchToHttp().getRequest<RequestWithUser>();
            const user = request.user
            return user.isActive
        }
    }
    return mixin(IsActiveMixin)
}
export default IsActiveWithJWTAuthenticationGuard;
