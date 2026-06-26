import type { Initiative } from "@/lib/agility/types";

import type { AssessmentFields } from "./assessment";
import type { CommsRecord } from "./comms";
import type { ChannelId } from "./channels";
import type { MissionId } from "./missions";
import type { TriagePool, WorkflowState } from "./workflow";

export type Submitter = {
  name: string;
  email: string;
};

export type ChamberInitiative = Initiative & {
  _chamberChannel?: ChannelId;
  _workflow?: WorkflowState;
  _cohortWeek?: string;
  _submittedAt?: string;
  _submitter?: Submitter;
  _requesterFields?: Record<string, string>;
  _triageOwner?: string;
  _triagePool?: TriagePool;
  _mission?: MissionId;
  _assessment?: AssessmentFields;
  _comms?: CommsRecord[];
  _workflowLog?: Array<{ at: string; action: string; from: string; to: string; actor?: string }>;
};