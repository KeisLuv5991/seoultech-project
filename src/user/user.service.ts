import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { CreateUserDto, CreateUserResponse } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

// move to config
const salt = 5;

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    const existedUser = await this.userRepository.findByEmail(
      createUserDto.email,
    );
    if (existedUser) {
      throw new BadRequestException();
    }
    const hash = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hash;
    const user = await this.userRepository.create(createUserDto);
    const token = await this.authService.login(user);
    return {
      user,
      token,
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne(id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number): Promise<any> {
    return this.userRepository.remove(id);
  }
}
