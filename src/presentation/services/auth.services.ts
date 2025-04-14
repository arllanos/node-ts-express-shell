import e from "express";
import { bcryptAdapter, JwtAdapter } from "../../config";
import { UserModel } from "../../data";
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from "../../domain";



export class AuthService {

    // ID
    constructor(){}

    public async registerUser(registerUserDto: RegisterUserDto) {

        const existUser = await UserModel.findOne({ email: registerUserDto.email });
        if (existUser) throw CustomError.badRequest('Email already exist');

        try {
            const user = new UserModel(registerUserDto);
            
            // encriptar la contraseña
            user.password = bcryptAdapter.hash(registerUserDto.password)
            
            await user.save();
            // JWT <--- para manterner la autenticacion del usuario

            // email de confirmacion

            const { password, ...userEntity } = UserEntity.fromObject(user);

            return { 
                user: userEntity, 
                token: 'ABC' 
            };
        } catch (error) {
            throw CustomError.internalServer(`${ error }`)
        }

        return 'todo ok!';

    }

 
    public async loginUser(loginUserDto: LoginUserDto) {

        const user = await UserModel.findOne({ email: loginUserDto.email});
        if (!user) throw CustomError.badRequest('Email do not exists');

        const isMatching = bcryptAdapter.compare(loginUserDto.password, user.password);
        if (!isMatching) throw CustomError.unauthorized('Invalid password');

        const { password, ...userEntity} = UserEntity.fromObject(user);

        const token = await JwtAdapter.generateToken({ id: user.id, email: user.email });
        if (!token) throw CustomError.internalServer('Errror while creating JWT');

        return {
            user: { userEntity },
            token: token,
        }

    }

}
