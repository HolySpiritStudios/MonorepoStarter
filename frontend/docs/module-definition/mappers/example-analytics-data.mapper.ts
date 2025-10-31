import { ExampleAnalyticsData } from '../types/example-analytics.type.ts';

interface Props {
  anythingIfNeed: string;
}

export const mapExampleAnalyticsData = (_props: Props): ExampleAnalyticsData => {
  return { something: false };
};
