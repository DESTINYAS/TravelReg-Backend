/* eslint-disable prettier/prettier */
import User from "../user/entities/user.entity"

interface RequestWithUser extends Request {
    user: User
}
export default RequestWithUser