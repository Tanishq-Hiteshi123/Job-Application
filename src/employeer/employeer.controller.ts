import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/auth/guards/authentication.guard';
import { UserRoles } from 'src/common/decorator/role.decorator';
import { SuccessMessage } from 'src/common/decorator/success-message.decorator';
import { UserRole } from 'src/common/entity/userRole.entity';
import { EmployeerService } from './employeer.service';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateNewJobDTO } from './dtos/createNewJob.dto';
import { Request } from 'express';
import { EditJobPostingDTO } from './dtos/editJobPosting';

@Controller('employeer')
export class EmployeerController {
  constructor(private employeerService: EmployeerService) {}
  // Creating the endpoints for the end user:-
  @Post('/jobs/create')
  @UseGuards(AuthenticationGuard, RoleGuard)
  @UserRoles(UserRole.EMPLOYER)
  @SuccessMessage('New Job Created')
  createNewJob(@Body() createNewJobDTO: CreateNewJobDTO, @Req() req: Request) {
    return this.employeerService.createNewJob(createNewJobDTO, req);
  }

  @Patch('/edit/:id')
  @UseGuards(AuthenticationGuard, RoleGuard)
  @UserRoles(UserRole.ADMIN, UserRole.EMPLOYER)
  @SuccessMessage('Job Posting Edited SuccessFully')
  editJobPosting(
    @Body() editJobPostingDTO: EditJobPostingDTO,
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.employeerService.editJobPosting(editJobPostingDTO, req, id);
  }
}
