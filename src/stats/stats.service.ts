import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Demande } from 'src/demande/demande.entity';
import { Event } from 'src/event/event.entity';
import { Authorization } from 'src/authorization/authorization.entity';
import { DEMANDE_STATUS, DEMANDE_TYPE } from 'src/demande/demande-status.enum';
import { EVENT_STATUS, EVENT_TYPE } from 'src/event/event.enum';
import { AUTHORIZATION_STATUS } from 'src/authorization/authorization-status.enum';
import { USER_ROLE } from 'src/users/role.enum';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Demande)
    private readonly demandeRepository: Repository<Demande>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Authorization)
    private readonly authorizationRepository: Repository<Authorization>,
  ) {}

  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  async getUserCountByRole(role: USER_ROLE): Promise<number> {
    return this.userRepository.count({ where: { role } });
  }

  async getDemandeCountByStatusAndType(
    status: DEMANDE_STATUS,
    type: DEMANDE_TYPE,
  ): Promise<number> {
    return this.demandeRepository.count({ where: { status, type } });
  }

  async getDemandeCountByMonth(
    status: DEMANDE_STATUS,
    type: DEMANDE_TYPE,
  ): Promise<{ month: string; count: number }[]> {
    return this.demandeRepository
      .createQueryBuilder('demande')
      .select("DATE_FORMAT(demande.date, '%Y-%m')", 'month')
      .addSelect('COUNT(demande.id)', 'count')
      .where('demande.status = :status', { status })
      .andWhere('demande.type = :type', { type })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getEventCountByStatusAndType(
    status: EVENT_STATUS,
    type: EVENT_TYPE,
  ): Promise<number> {
    return this.eventRepository.count({ where: { status, type } });
  }

  async getEventCountByMonth(
    status: EVENT_STATUS,
    type: EVENT_TYPE,
  ): Promise<{ month: string; count: number }[]> {
    return this.eventRepository
      .createQueryBuilder('event')
      .select("DATE_FORMAT(event.date, '%Y-%m')", 'month')
      .addSelect('COUNT(event.id)', 'count')
      .where('event.status = :status', { status })
      .andWhere('event.type = :type', { type })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getAuthorizationCountByStatus(
    status: AUTHORIZATION_STATUS,
  ): Promise<number> {
    return this.authorizationRepository.count({ where: { status } });
  }

  async getAuthorizationCountByMonth(
    status: AUTHORIZATION_STATUS,
  ): Promise<{ month: string; count: number }[]> {
    return this.authorizationRepository
      .createQueryBuilder('authorization')
      .select("DATE_FORMAT(authorization.creation_date, '%Y-%m')", 'month')
      .addSelect('COUNT(authorization.id)', 'count')
      .where('authorization.status = :status', { status })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
  }

  async getStats() {
    const userCount = await this.getUserCount();
    const userCountsByRole = await Promise.all(
      Object.values(USER_ROLE).map((role) => this.getUserCountByRole(role)),
    );
    const demandeCounts = await Promise.all([
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.ACCEPTED,
        DEMANDE_TYPE.DEMANDE,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.PENDING,
        DEMANDE_TYPE.DEMANDE,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.REJECTED,
        DEMANDE_TYPE.DEMANDE,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.ACCEPTED,
        DEMANDE_TYPE.CONTESTATION,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.PENDING,
        DEMANDE_TYPE.CONTESTATION,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.REJECTED,
        DEMANDE_TYPE.CONTESTATION,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.ACCEPTED,
        DEMANDE_TYPE.PROPOSITION,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.PENDING,
        DEMANDE_TYPE.PROPOSITION,
      ),
      this.getDemandeCountByStatusAndType(
        DEMANDE_STATUS.REJECTED,
        DEMANDE_TYPE.PROPOSITION,
      ),
    ]);
    const demandeCountsByMonth = await Promise.all([
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.ACCEPTED,
        DEMANDE_TYPE.DEMANDE,
      ),
      this.getDemandeCountByMonth(DEMANDE_STATUS.PENDING, DEMANDE_TYPE.DEMANDE),
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.REJECTED,
        DEMANDE_TYPE.DEMANDE,
      ),
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.ACCEPTED,
        DEMANDE_TYPE.CONTESTATION,
      ),
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.PENDING,
        DEMANDE_TYPE.CONTESTATION,
      ),
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.REJECTED,
        DEMANDE_TYPE.CONTESTATION,
      ),
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.ACCEPTED,
        DEMANDE_TYPE.PROPOSITION,
      ),
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.PENDING,
        DEMANDE_TYPE.PROPOSITION,
      ),
      this.getDemandeCountByMonth(
        DEMANDE_STATUS.REJECTED,
        DEMANDE_TYPE.PROPOSITION,
      ),
    ]);
    const eventCounts = await Promise.all([
      this.getEventCountByStatusAndType(
        EVENT_STATUS.ACCEPTED,
        EVENT_TYPE.EVENT,
      ),
      this.getEventCountByStatusAndType(EVENT_STATUS.PENDING, EVENT_TYPE.EVENT),
      this.getEventCountByStatusAndType(
        EVENT_STATUS.REJECTED,
        EVENT_TYPE.EVENT,
      ),
      this.getEventCountByStatusAndType(EVENT_STATUS.ACCEPTED, EVENT_TYPE.NEWS),
      this.getEventCountByStatusAndType(EVENT_STATUS.PENDING, EVENT_TYPE.NEWS),
      this.getEventCountByStatusAndType(EVENT_STATUS.REJECTED, EVENT_TYPE.NEWS),
      this.getEventCountByStatusAndType(
        EVENT_STATUS.ACCEPTED,
        EVENT_TYPE.ANNOUNCEMENT,
      ),
      this.getEventCountByStatusAndType(
        EVENT_STATUS.PENDING,
        EVENT_TYPE.ANNOUNCEMENT,
      ),
      this.getEventCountByStatusAndType(
        EVENT_STATUS.REJECTED,
        EVENT_TYPE.ANNOUNCEMENT,
      ),
    ]);
    const eventCountsByMonth = await Promise.all([
      this.getEventCountByMonth(EVENT_STATUS.ACCEPTED, EVENT_TYPE.EVENT),
      this.getEventCountByMonth(EVENT_STATUS.PENDING, EVENT_TYPE.EVENT),
      this.getEventCountByMonth(EVENT_STATUS.REJECTED, EVENT_TYPE.EVENT),
      this.getEventCountByMonth(EVENT_STATUS.ACCEPTED, EVENT_TYPE.NEWS),
      this.getEventCountByMonth(EVENT_STATUS.PENDING, EVENT_TYPE.NEWS),
      this.getEventCountByMonth(EVENT_STATUS.REJECTED, EVENT_TYPE.NEWS),
      this.getEventCountByMonth(EVENT_STATUS.ACCEPTED, EVENT_TYPE.ANNOUNCEMENT),
      this.getEventCountByMonth(EVENT_STATUS.PENDING, EVENT_TYPE.ANNOUNCEMENT),
      this.getEventCountByMonth(EVENT_STATUS.REJECTED, EVENT_TYPE.ANNOUNCEMENT),
    ]);
    const authorizationCounts = await Promise.all([
      this.getAuthorizationCountByStatus(AUTHORIZATION_STATUS.ACCEPTED),
      this.getAuthorizationCountByStatus(AUTHORIZATION_STATUS.PENDING),
      this.getAuthorizationCountByStatus(AUTHORIZATION_STATUS.REJECTED),
    ]);
    const authorizationCountsByMonth = await Promise.all([
      this.getAuthorizationCountByMonth(AUTHORIZATION_STATUS.ACCEPTED),
      this.getAuthorizationCountByMonth(AUTHORIZATION_STATUS.PENDING),
      this.getAuthorizationCountByMonth(AUTHORIZATION_STATUS.REJECTED),
    ]);

    return {
      userCount,
      userCountsByRole: Object.values(USER_ROLE).reduce((acc, role, index) => {
        acc[role] = userCountsByRole[index];
        return acc;
      }, {}),
      demandeCounts: {
        demande: {
          accepted: demandeCounts[0],
          pending: demandeCounts[1],
          rejected: demandeCounts[2],
        },
        contestation: {
          accepted: demandeCounts[3],
          pending: demandeCounts[4],
          rejected: demandeCounts[5],
        },
        proposition: {
          accepted: demandeCounts[6],
          pending: demandeCounts[7],
          rejected: demandeCounts[8],
        },
      },
      demandeCountsByMonth: {
        demande: {
          accepted: demandeCountsByMonth[0],
          pending: demandeCountsByMonth[1],
          rejected: demandeCountsByMonth[2],
        },
        contestation: {
          accepted: demandeCountsByMonth[3],
          pending: demandeCountsByMonth[4],
          rejected: demandeCountsByMonth[5],
        },
        proposition: {
          accepted: demandeCountsByMonth[6],
          pending: demandeCountsByMonth[7],
          rejected: demandeCountsByMonth[8],
        },
      },
      eventCounts: {
        event: {
          accepted: eventCounts[0],
          pending: eventCounts[1],
          rejected: eventCounts[2],
        },
        news: {
          accepted: eventCounts[3],
          pending: eventCounts[4],
          rejected: eventCounts[5],
        },
        announcement: {
          accepted: eventCounts[6],
          pending: eventCounts[7],
          rejected: eventCounts[8],
        },
      },
      eventCountsByMonth: {
        event: {
          accepted: eventCountsByMonth[0],
          pending: eventCountsByMonth[1],
          rejected: eventCountsByMonth[2],
        },
        news: {
          accepted: eventCountsByMonth[3],
          pending: eventCountsByMonth[4],
          rejected: eventCountsByMonth[5],
        },
        announcement: {
          accepted: eventCountsByMonth[6],
          pending: eventCountsByMonth[7],
          rejected: eventCountsByMonth[8],
        },
      },
      authorizationCounts: {
        accepted: authorizationCounts[0],
        pending: authorizationCounts[1],
        rejected: authorizationCounts[2],
      },
      authorizationCountsByMonth: {
        accepted: authorizationCountsByMonth[0],
        pending: authorizationCountsByMonth[1],
        rejected: authorizationCountsByMonth[2],
      },
    };
  }
}
