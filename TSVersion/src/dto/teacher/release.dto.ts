export interface ReleaseSummaryDto {
  id: number;
  version: string;
  url: string;
  createdAt: Date;
}

export interface ReleaseDetailDto extends ReleaseSummaryDto {}
