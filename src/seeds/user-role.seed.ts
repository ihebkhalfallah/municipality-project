import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { USER_ROLE } from '../users/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRoleSeed {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed() {
    const roles = [
      USER_ROLE.SUPER_ADMIN,
      USER_ROLE.PERMISSION_ADMIN,
      USER_ROLE.CONTESTATION_ADMIN,
      USER_ROLE.DEMANDE_ADMIN,
      USER_ROLE.CITIZEN,
      USER_ROLE.ORGANIZATION,
    ];

    for (const [index, role] of roles.entries()) {
      const email = `${role.toLowerCase()}@example.com`;
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (!existingUser) {
        const user = new User();
        user.firstName = `${role.toLowerCase()}_first`;
        user.lastName = `${role.toLowerCase()}_last`;
        user.email = email;
        user.password = await bcrypt.hash('password', 10);
        user.previousPassword = user.password;
        user.role = role;
        user.birthDate = new Date('1990-01-01');
        user.phoneNumber = `123456789${index}`;
        user.job = 'Job';
        user.profile_photo = 'profile_photo.png';
        user.locked = false;

        await this.userRepository.save(user);
      }
    }
  }
}
