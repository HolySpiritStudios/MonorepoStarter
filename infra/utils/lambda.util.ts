import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { type NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

import { isProduction } from '../constants/environment.constant';

import { getRoot } from './directory.util';

export function getBaseLambdaProps(env: string, vpc?: IVpc, root = getRoot()): NodejsFunctionProps {
  return {
    runtime: Runtime.NODEJS_22_X,
    environment: {},
    handler: 'handler',
    logRetention: isProduction(env) ? RetentionDays.ONE_YEAR : RetentionDays.TWO_WEEKS,
    vpc,
    vpcSubnets: vpc ? { subnetType: SubnetType.PRIVATE_WITH_EGRESS } : undefined,
    bundling: {
      workingDirectory: root,
      keepNames: true,
      minify: true,
    },
  };
}
