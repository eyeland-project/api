export interface CourseSummaryDto {
  id: number;
  name: string;
}

export interface CourseDetailDto extends CourseSummaryDto {
  session: boolean;
}

export interface CourseCreateDto {
  name: string;
}

interface CourseUpdate extends CourseCreateDto {
  deleted: true;
  session: boolean;
}

export type CourseUpdateDto = Partial<CourseUpdate>;
