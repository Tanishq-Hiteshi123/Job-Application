import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNewJobDTO } from './dtos/createNewJob.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request } from 'express';
import { EditJobPostingDTO } from './dtos/editJobPosting';
import { DecodedPayloadUser } from 'src/auth/entity/decodedPayload.entity';

@Injectable()
export class EmployeerService {
  constructor(private prismaService: PrismaService) {}
  async createNewJob(createNewJobDetails: CreateNewJobDTO, req: Request) {
    try {
      const { title, description, location, salary } = createNewJobDetails;

      if (!title || !description || !location || (!salary && salary > 0)) {
        throw new BadRequestException(
          'Fill all the fields with the Correct Values',
        );
      }

      const newJob = await this.prismaService.job.create({
        data: {
          title,
          salary,
          description,
          location,
          employerId: req['user']?.userId,
        },
      });

      if (!newJob) {
        throw new InternalServerErrorException('New Job could get posted');
      }

      return {
        newJob,
      };
    } catch (error) {
      throw error;
    }
  }

  async editJobPosting(
    editJobData: EditJobPostingDTO,
    req: Request,
    id: number,
  ) {
    try {
      const { title, description, salary, isActive, location } = editJobData;

      if (!id) {
        throw new BadRequestException('Job Id is not provided');
      }

      const jobToUpdate = await this.prismaService.job.findUnique({
        where: {
          id: id,
        },
      });

      if (!jobToUpdate) {
        throw new NotFoundException('Job with requested Id not found');
      }

      const loggedInUser: DecodedPayloadUser = req['user'];
      if (loggedInUser?.userRole == 'EMPLOYER') {
        // Check for the Id :-
        if (loggedInUser?.userId != jobToUpdate.employerId) {
          throw new ForbiddenException(
            'You are only allowed to change your posted Jobs',
          );
        }
      }

      // Now You can update :-
      const updatedJobDetails = await this.prismaService.job.update({
        where: {
          id: jobToUpdate.id,
        },
        data: {
          title: title || jobToUpdate.title,
          description: description || jobToUpdate.description,
          salary: +salary || jobToUpdate.salary,
          location: location || jobToUpdate.location,
        },
      });

      if (!updatedJobDetails) {
        throw new InternalServerErrorException(
          'Job Details could not get updated',
        );
      }

      return {
        updatedJobDetails,
      };
    } catch (error) {
      throw error;
    }
  }
}
