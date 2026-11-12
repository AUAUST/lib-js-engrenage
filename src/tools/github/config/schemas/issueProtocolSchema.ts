import { picklist, string } from "valibot";

import { map } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import { declare, declareObject } from "#foundation/options/index";
import {
  closeReasonMeanings,
  fieldMeanings,
  optionMeanings,
  typeMeanings,
} from "#tools/github/issues/contract/constants";
import type { ProtocolMeaning } from "#tools/github/issues/contract/index";

const closeReasonSchema = picklist(
  map(values(closeReasonMeanings), ({ name }) => name),
);

function declareName({ name, intent }: ProtocolMeaning) {
  return declare(string(), {
    description: intent,
    optional: { value: name },
  });
}

function declareCloseReason({ name, intent }: ProtocolMeaning) {
  return declare(closeReasonSchema, {
    description: intent,
    optional: { value: name },
  });
}

// @debt Each group re-lists its meaning keys by hand; derive the entries from the meaning constants once `declareObject` types a mapped record without a cast.
export const issueProtocolSchema = declareObject(
  {
    types: declareObject(
      {
        plan: declareName(typeMeanings.plan),
        segment: declareName(typeMeanings.segment),
        task: declareName(typeMeanings.task),
        problem: declareName(typeMeanings.problem),
        resource: declareName(typeMeanings.resource),
        idea: declareName(typeMeanings.idea),
      } satisfies Record<keyof typeof typeMeanings, unknown>,
      {
        description: "GitHub issue type of each type meaning.",
        optional: true,
      },
    ),
    fields: declareObject(
      {
        nature: declareName(fieldMeanings.nature),
        defect: declareName(fieldMeanings.defect),
        priority: declareName(fieldMeanings.priority),
        complexity: declareName(fieldMeanings.complexity),
        material: declareName(fieldMeanings.material),
        blockers: declareName(fieldMeanings.blockers),
      } satisfies Record<keyof typeof fieldMeanings, unknown>,
      {
        description: "GitHub issue field of each field meaning.",
        optional: true,
      },
    ),
    options: declareObject(
      {
        feature: declareName(optionMeanings.feature),
        improvement: declareName(optionMeanings.improvement),
        chore: declareName(optionMeanings.chore),
        bug: declareName(optionMeanings.bug),
        debt: declareName(optionMeanings.debt),
        performance: declareName(optionMeanings.performance),
        urgent: declareName(optionMeanings.urgent),
        highPriority: declareName(optionMeanings.highPriority),
        lowPriority: declareName(optionMeanings.lowPriority),
        trivial: declareName(optionMeanings.trivial),
        involved: declareName(optionMeanings.involved),
        complex: declareName(optionMeanings.complex),
        reference: declareName(optionMeanings.reference),
        specification: declareName(optionMeanings.specification),
        report: declareName(optionMeanings.report),
        archive: declareName(optionMeanings.archive),
        questions: declareName(optionMeanings.questions),
        outdated: declareName(optionMeanings.outdated),
        awaitingOthers: declareName(optionMeanings.awaitingOthers),
        delayed: declareName(optionMeanings.delayed),
        drafting: declareName(optionMeanings.drafting),
      } satisfies Record<keyof typeof optionMeanings, unknown>,
      {
        description: "GitHub option of each option meaning, within the field its meaning belongs to.",
        optional: true,
      },
    ),
    closeReasons: declareObject(
      {
        completed: declareCloseReason(closeReasonMeanings.completed),
        notPlanned: declareCloseReason(closeReasonMeanings.notPlanned),
        duplicate: declareCloseReason(closeReasonMeanings.duplicate),
      } satisfies Record<keyof typeof closeReasonMeanings, unknown>,
      {
        description: "GitHub close reason of each close meaning.",
        optional: true,
      },
    ),
  },
  {
    description: [
      "GitHub names of the issue protocol's meanings, which skills and checks name instead.",
      "`engrenage sync agents` fails when the snapshot of `engrenage github fetch` lacks a mapped type, field or option.",
    ],
    optional: true,
  },
);
