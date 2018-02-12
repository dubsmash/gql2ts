import { IFromQueryOptions, WrapType } from '../../types/src';
import { DEFAULT_OPTIONS as TS_OPTIONS } from '../../language-typescript/src';

export const FLOW_WRAP_PARTIAL: WrapType = partial => `$SHAPE<${partial}>`;
export const FLOW_POST_PROCESSOR: WrapType = str => `/* @flow */

${str}
`;

export const DEFAULT_OPTIONS: IFromQueryOptions = {
  ...TS_OPTIONS,
  wrapPartial: FLOW_WRAP_PARTIAL,
  postProcessor: FLOW_POST_PROCESSOR
};
export default DEFAULT_OPTIONS;
