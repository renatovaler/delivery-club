import { Module } from '@nestjs/common';
import { TeamMemberController } from './team-member.controller';
import { TeamMemberService } from './team-member.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamMemberController],
  providers: [TeamMemberService],
})
export class TeamMemberModule {}
